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

const MAX_PAGES = 50;
const CRAWL_DELAY_MS = 400;
const MAX_DEPTH = 3;

/**
 * Atomically patches a subset of fields on a session.
 * Uses an in-memory cache object when provided to avoid repeated DB reads.
 *
 * @param {string} sessionId
 * @param {object} fields
 * @param {object} [cache] - Optional mutable in-memory session reference to update alongside the store.
 */
async function patchSession(sessionId, fields, cache) {
  const current = cache ?? (await sessionStore.get(sessionId));
  if (!current) return;

  const updated = { ...current, ...fields };

  if (cache) Object.assign(cache, fields);

  await sessionStore.set(sessionId, updated);
}

/**
 * Full RAG ingestion pipeline: crawl → clean → extract → chunk → embed → upsert → ready.
 *
 * Progress milestones:
 *   0–29  : crawling pages
 *   30–49 : pipeline stage transitions (clean/extract/chunk)
 *   50–59 : chunking
 *   60–79 : embedding
 *   80–99 : Qdrant upsert
 *   100   : ready
 *
 * @param {string} sessionId - Active session UUID.
 * @param {string} startUrl  - Seed URL for the crawl.
 */
export async function crawlWebsite(sessionId, startUrl) {
  logger.info(`[${sessionId}] Pipeline starting for: ${startUrl}`);

  // Load once and keep an in-memory copy — avoids a DB read on every patchSession call
  const sessionCache = await sessionStore.get(sessionId);
  if (!sessionCache) {
    logger.error(`[${sessionId}] Session not found — aborting pipeline.`);
    return;
  }

  await patchSession(sessionId, {
    stage: PIPELINE_STAGES.CRAWLING,
    progress: 0,
    status: SESSION_STATUS.PROCESSING,
  }, sessionCache);

  const visited = new Set();
  const queue = new Queue();
  const crawledPages = [];

  queue.enqueue({ url: startUrl, depth: 0 });

  const browser = await initBrowser();
  const context = await browser.newContext({
    userAgent: 'SiteChatBot/1.0',
    viewport: { width: 1280, height: 800 },
  });

  // ── Phase 1: Crawl ────────────────────────────────────────────────────────
  try {
    while (!queue.isEmpty() && crawledPages.length < MAX_PAGES) {
      const { url, depth } = queue.dequeue();

      if (visited.has(url)) continue;
      visited.add(url);

      if (depth > MAX_DEPTH) continue;

      const allowed = await canCrawl(url);
      if (!allowed) {
        logger.info(`[${sessionId}] robots.txt blocked: ${url}`);
        continue;
      }

      const crawlProgress = Math.min(29, Math.floor((crawledPages.length / MAX_PAGES) * 30));
      await patchSession(sessionId, {
        stage: PIPELINE_STAGES.CRAWLING,
        progress: crawlProgress,
        currentPage: url,
        pagesVisited: crawledPages.length,
      }, sessionCache);

      logger.info(`[${sessionId}] Crawling (${crawledPages.length + 1}/${MAX_PAGES}): ${url}`);

      try {
        const pageData = await crawlPage(context, url);

        const cleanedHtml = cleanHtml(pageData.html);
        const extracted = extractContent({ url: pageData.url, title: pageData.title, html: cleanedHtml });

        if (!extracted) {
          logger.warn(`[${sessionId}] Skipping low-content page: ${url}`);
        } else {
          crawledPages.push({ url: pageData.url, title: pageData.title, content: extracted.content });

          const pages = [...(sessionCache.pages || []), { url: pageData.url, title: pageData.title }];
          await patchSession(sessionId, { pages, pagesVisited: crawledPages.length }, sessionCache);
        }

        // Always extract links regardless of content quality so we discover more pages
        if (depth < MAX_DEPTH) {
          const links = extractLinks(pageData.html, url);
          logger.debug(`[${sessionId}] Found ${links.length} links on: ${url}`);
          for (const link of links) {
            if (!visited.has(link)) queue.enqueue({ url: link, depth: depth + 1 });
          }
        }

        await delay(CRAWL_DELAY_MS);
      } catch (pageError) {
        logger.warn(`[${sessionId}] Page failed after retries "${url}": ${pageError.message}`);
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
    }, sessionCache);
    logger.error(`[${sessionId}] Pipeline failed: no usable pages crawled.`);
    return;
  }

  await patchSession(sessionId, {
    totalPages: crawledPages.length,
    pagesVisited: crawledPages.length,
    progress: 30,
  }, sessionCache);

  // ── Phase 2: Chunk ────────────────────────────────────────────────────────
  await patchSession(sessionId, { stage: PIPELINE_STAGES.CHUNKING, progress: 50 }, sessionCache);

  const allChunks = [];
  for (const page of crawledPages) {
    allChunks.push(...chunkText(page));
  }

  logger.info(`[${sessionId}] Chunking complete — ${allChunks.length} chunks created.`);
  await patchSession(sessionId, { chunksCreated: allChunks.length, progress: 60 }, sessionCache);

  if (allChunks.length === 0) {
    await patchSession(sessionId, {
      status: SESSION_STATUS.FAILED,
      stage: PIPELINE_STAGES.CHUNKING,
    }, sessionCache);
    logger.error(`[${sessionId}] Pipeline failed: no chunks produced.`);
    return;
  }

  // ── Phase 3: Embed ────────────────────────────────────────────────────────
  await patchSession(sessionId, { stage: PIPELINE_STAGES.EMBEDDING, progress: 60 }, sessionCache);
  logger.info(`[${sessionId}] Generating embeddings for ${allChunks.length} chunks...`);

  let embeddedCount = 0;
  const embeddings = await generateEmbeddings(allChunks, async (completed, total) => {
    embeddedCount = completed;
    const embedProgress = 60 + Math.floor((completed / total) * 20);
    await patchSession(sessionId, {
      embeddingsCreated: completed,
      progress: Math.min(79, embedProgress),
    }, sessionCache);
  });

  logger.info(`[${sessionId}] Embeddings complete — ${embeddedCount} vectors generated.`);
  await patchSession(sessionId, { embeddingsCreated: embeddedCount, progress: 80 }, sessionCache);

  // ── Phase 4: Upsert ───────────────────────────────────────────────────────
  await patchSession(sessionId, { stage: PIPELINE_STAGES.INDEXING, progress: 80 }, sessionCache);
  logger.info(`[${sessionId}] Upserting vectors into Qdrant...`);

  const validPairs = allChunks
    .map((chunk, i) => ({ chunk, vector: embeddings[i] }))
    .filter(({ vector }) => Array.isArray(vector) && vector.length > 0);

  try {
    await upsertChunks(sessionId, validPairs.map(p => p.chunk), validPairs.map(p => p.vector));
    logger.info(`[${sessionId}] Upserted ${validPairs.length} vectors successfully.`);
  } catch (upsertError) {
    logger.error(`[${sessionId}] Qdrant upsert failed: ${upsertError.message}`);
    await patchSession(sessionId, { status: SESSION_STATUS.FAILED }, sessionCache);
    return;
  }

  // ── Phase 5: Ready ────────────────────────────────────────────────────────
  await patchSession(sessionId, {
    status: SESSION_STATUS.READY,
    stage: PIPELINE_STAGES.READY,
    progress: 100,
    vectorsStored: validPairs.length,
    currentPage: '',
  }, sessionCache);

  logger.info(`[${sessionId}] Pipeline complete — session is ready.`);
}
