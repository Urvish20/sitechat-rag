import Queue from './queue.js';
import { canCrawl } from './robots.js';
import { extractLinks } from './extractLinks.js';
import { initBrowser, crawlPage } from './crawlPage.js';
import { sessionStore } from '../session/session.store.js';
import { delay } from '../../utils/helpers.js';
import { logger } from '../../utils/logger.js';
import { SESSION_STATUS, PIPELINE_STAGES } from '../../utils/constants.js';
import { cleanHtml } from '../parser/cleanHtml.js';
import { extractContent } from '../parser/extractContent.js';
import { chunkText } from '../chunking/chunkText.js';
import { generateEmbeddings } from '../embedding/geminiEmbedding.js';
import { upsertChunks } from '../vector/qdrant.service.js';

/**
 */
async function patchSession(sessionId, fields) {
  const session = await sessionStore.get(sessionId);
  if (!session) return;
  await sessionStore.set(sessionId, { ...session, ...fields });
}

/**
 *
 * @param {string} sessionId - Active session UUID.
 * @param {string} startUrl  - Seed URL to begin crawling.
 */
export async function crawlWebsite(sessionId, startUrl) {
  logger.info(`[${sessionId}] Pipeline starting for: ${startUrl}`);

  await patchSession(sessionId, {
    stage: PIPELINE_STAGES.CRAWLING,
    progress: 0,
    status: SESSION_STATUS.PROCESSING,
  });

  const visited = new Set();
  const queue = new Queue();
  const crawledPages = [];

  queue.enqueue({ url: startUrl, depth: 0 });

  const browser = await initBrowser();
  const context = await browser.newContext({
    userAgent: 'SiteChatBot/1.0',
    viewport: { width: 1280, height: 800 },
  });

  // ── Phase 1: Crawl ──────────────────────────────────────────────────────────
  try {
    while (!queue.isEmpty() && crawledPages.length < 50) {
      const { url, depth } = queue.dequeue();

      if (visited.has(url)) continue;
      visited.add(url);

      const allowed = await canCrawl(url);
      if (!allowed) {
        logger.info(`[${sessionId}] robots.txt blocked: ${url}`);
        continue;
      }

      if (depth > 3) continue;

      const crawledCount = crawledPages.length;
      const crawlProgress = Math.min(29, Math.floor((crawledCount / 50) * 30));

      await patchSession(sessionId, {
        stage: PIPELINE_STAGES.CRAWLING,
        progress: crawlProgress,
        currentPage: url,
        pagesVisited: crawledCount,
      });

      logger.info(`[${sessionId}] Crawling (${crawledCount + 1}/50): ${url}`);

      try {
        const pageData = await crawlPage(context, url);

        // ── Phase 2 (inline): Clean HTML ──
        await patchSession(sessionId, { stage: PIPELINE_STAGES.CLEANING, progress: 30 });
        const cleanedHtml = cleanHtml(pageData.html);

        // ── Phase 3 (inline): Extract Content ──
        await patchSession(sessionId, { stage: PIPELINE_STAGES.EXTRACTING, progress: 35 });
        const extracted = extractContent({
          url: pageData.url,
          title: pageData.title,
          html: cleanedHtml,
        });

        if (!extracted) {
          logger.warn(`[${sessionId}] Skipping low-content page: ${url}`);
          if (depth < 3) {
            const links = extractLinks(pageData.html, url);
            for (const link of links) {
              if (!visited.has(link)) queue.enqueue({ url: link, depth: depth + 1 });
            }
          }
          await delay(500);
          continue;
        }

        crawledPages.push({
          url: pageData.url,
          title: pageData.title,
          content: extracted.content,
        });

        const currentSession = await sessionStore.get(sessionId);
        if (currentSession) {
          const pages = currentSession.pages || [];
          pages.push({ url: pageData.url, title: pageData.title });
          await sessionStore.set(sessionId, {
            ...currentSession,
            pages,
            pagesVisited: crawledPages.length,
            progress: Math.min(29, Math.floor((crawledPages.length / 50) * 30)),
          });
        }

        await delay(500);

        if (depth < 3) {
          const links = extractLinks(pageData.html, url);
          logger.info(`[${sessionId}] Found ${links.length} links on: ${url}`);
          for (const link of links) {
            if (!visited.has(link)) queue.enqueue({ url: link, depth: depth + 1 });
          }
        }
      } catch (pageError) {
        logger.warn(`[${sessionId}] Skipping failed page "${url}": ${pageError.message}`);
      }
    }
  } finally {
    await context.close();
  }

  logger.info(`[${sessionId}] Crawl complete — ${crawledPages.length} pages collected.`);

  if (crawledPages.length === 0) {
    await patchSession(sessionId, {
      status: SESSION_STATUS.FAILED,
      stage: PIPELINE_STAGES.CRAWLING,
      progress: 0,
      totalPages: 0,
    });
    logger.error(`[${sessionId}] Pipeline failed: no usable pages crawled.`);
    return;
  }

  await patchSession(sessionId, {
    totalPages: crawledPages.length,
    pagesVisited: crawledPages.length,
    progress: 30,
  });

  // ── Phase 4: Chunk all pages ────────────────────────────────────────────────
  await patchSession(sessionId, { stage: PIPELINE_STAGES.CHUNKING, progress: 50 });

  const allChunks = [];
  for (const page of crawledPages) {
    const pageChunks = chunkText(page);
    allChunks.push(...pageChunks);
  }

  logger.info(`[${sessionId}] Chunking complete — ${allChunks.length} chunks created.`);
  await patchSession(sessionId, { chunksCreated: allChunks.length, progress: 60 });

  if (allChunks.length === 0) {
    await patchSession(sessionId, {
      status: SESSION_STATUS.FAILED,
      stage: PIPELINE_STAGES.CHUNKING,
    });
    logger.error(`[${sessionId}] Pipeline failed: no chunks produced.`);
    return;
  }

  // ── Phase 5: Generate Embeddings ────────────────────────────────────────────
  await patchSession(sessionId, { stage: PIPELINE_STAGES.EMBEDDING, progress: 60 });
  logger.info(`[${sessionId}] Generating embeddings for ${allChunks.length} chunks...`);

  let embeddedCount = 0;

  const embeddings = await generateEmbeddings(allChunks, async (completed, total) => {
    embeddedCount = completed;
    const embedProgress = 60 + Math.floor((completed / total) * 20);
    await patchSession(sessionId, {
      embeddingsCreated: completed,
      progress: Math.min(79, embedProgress),
    });
  });

  logger.info(`[${sessionId}] Embeddings complete — ${embeddedCount} vectors generated.`);
  await patchSession(sessionId, { embeddingsCreated: embeddedCount, progress: 80 });

  // ── Phase 6: Upsert into Qdrant ─────────────────────────────────────────────
  await patchSession(sessionId, { stage: PIPELINE_STAGES.INDEXING, progress: 80 });
  logger.info(`[${sessionId}] Upserting ${allChunks.length} vectors into Qdrant...`);

  const validPairs = allChunks
    .map((chunk, i) => ({ chunk, vector: embeddings[i] }))
    .filter(({ vector }) => Array.isArray(vector) && vector.length > 0);

  const validChunks = validPairs.map((p) => p.chunk);
  const validVectors = validPairs.map((p) => p.vector);

  try {
    await upsertChunks(sessionId, validChunks, validVectors);
    logger.info(`[${sessionId}] Upserted ${validChunks.length} vectors successfully.`);
  } catch (upsertError) {
    logger.error(`[${sessionId}] Qdrant upsert failed:`, upsertError.message);
    await patchSession(sessionId, { status: SESSION_STATUS.FAILED });
    return;
  }

  // ── Phase 7: Mark Ready ─────────────────────────────────────────────────────
  await patchSession(sessionId, {
    status: SESSION_STATUS.READY,
    stage: PIPELINE_STAGES.READY,
    progress: 100,
    vectorsStored: validChunks.length,
    currentPage: 'Completed',
  });

  logger.info(`[${sessionId}] Pipeline complete. Session is ready.`);
}
