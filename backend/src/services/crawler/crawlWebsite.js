import Queue from './queue.js';
import { canCrawl } from './robots.js';
import { extractLinks, normalizeUrl, isLowValueUrl } from './extractLinks.js';
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
const MAX_QUEUE_LIMIT = 1000;

/**
 * Patches session fields using an in-memory cache to reduce DB round-trips.
 * Throws STOP_PIPELINE if the session is deleted from the store (cancel request).
 */
async function patchSession(sessionId, fields, cache) {
  const exists = await sessionStore.has(sessionId);
  if (!exists) {
    throw new Error('STOP_PIPELINE');
  }
  const current = cache ?? (await sessionStore.get(sessionId));
  if (!current) return;
  const updated = { ...current, ...fields };
  if (cache) Object.assign(cache, fields);
  await sessionStore.set(sessionId, updated);
}

/**
 * Full RAG ingestion pipeline.
 * Crawl → Clean → Extract → Chunk → Embed → Upsert → Ready
 *
 * @param {string} sessionId - Active session UUID.
 * @param {string} startUrl  - Seed URL to crawl.
 */
export async function crawlWebsite(sessionId, startUrl) {
  const crawlStart = Date.now();
  logger.info(`[${sessionId}] Pipeline starting for: ${startUrl}`);

  try {
    const sessionCache = await sessionStore.get(sessionId);
    if (!sessionCache) {
      logger.error(`[${sessionId}] Session not found — aborting pipeline.`);
      return;
    }

    await patchSession(sessionId, {
      stage: PIPELINE_STAGES.CRAWLING,
      progress: 0,
      status: SESSION_STATUS.PROCESSING,
      crawlStartedAt: new Date().toISOString(),
      pagesSkipped: 0,
      externalLinksIgnored: 0,
      logs: [`[${new Date().toISOString()}] Pipeline started for ${startUrl}`],
    }, sessionCache);

    const visited = new Set();
    const queued = new Set();
    const queue = new Queue();
    const crawledPages = [];

    // Stats tracking for debug summary
    const linkStats = { externalUrlsSkipped: 0 };
    let duplicateUrlsSkipped = 0;
    let robotsTxtBlocked = 0;
    let queuePeakSize = 0;

    // Normalize and enqueue the initial URL
    const normalizedStartUrl = normalizeUrl(startUrl, startUrl);
    queue.enqueue({ url: normalizedStartUrl, depth: 0 });
    queued.add(normalizedStartUrl);
    queuePeakSize = 1;

    const browser = await initBrowser();
    const context = await browser.newContext({
      userAgent: 'SiteChatBot/1.0',
      viewport: { width: 1280, height: 800 },
      ignoreHTTPSErrors: true,
    });

    const appendLog = async (message) => {
      const entry = `[${new Date().toISOString()}] ${message}`;
      const currentLogs = sessionCache.logs || [];
      await patchSession(sessionId, { logs: [...currentLogs.slice(-49), entry] }, sessionCache);
    };

    // ── Phase 1: Crawl ────────────────────────────────────────────────────────
    try {
      while (!queue.isEmpty() && crawledPages.length < MAX_PAGES) {
        const { url, depth } = queue.dequeue();

        // Prevent duplicate processing of already visited urls
        if (visited.has(url)) continue;
        visited.add(url);

        if (depth > MAX_DEPTH) continue;

        // Verify robots.txt rules before hitting page
        const allowed = await canCrawl(url);
        if (!allowed) {
          logger.info(`[${sessionId}] robots.txt blocked: ${url}`);
          await appendLog(`robots.txt blocked: ${url}`);
          robotsTxtBlocked++;
          await patchSession(sessionId, { pagesSkipped: (sessionCache.pagesSkipped || 0) + 1 }, sessionCache);
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
        await appendLog(`Crawling: ${url}`);

        try {
          const pageData = await crawlPage(context, url);

          const cleanedHtml = cleanHtml(pageData.html);
          const extracted = extractContent({ url: pageData.url, title: pageData.title, html: cleanedHtml });

          let links = [];
          if (depth < MAX_DEPTH) {
            // Cheerio-based extraction (clean internal links only)
            links = extractLinks(pageData.html, url, linkStats);

            for (const link of links) {
              const normalizedLink = normalizeUrl(link, url);

              if (visited.has(normalizedLink) || queued.has(normalizedLink)) {
                duplicateUrlsSkipped++;
                continue;
              }

              // Enforce maximum queue size limit to prevent out-of-memory or infinite crawl issues
              if (queued.size >= MAX_QUEUE_LIMIT) {
                logger.warn(`[${sessionId}] Queue limit of ${MAX_QUEUE_LIMIT} reached. Skipping further link additions.`);
                await appendLog(`Queue limit reached. Discovery stopped.`);
                break;
              }

              queue.enqueue({ url: normalizedLink, depth: depth + 1 });
              queued.add(normalizedLink);
              queuePeakSize = Math.max(queuePeakSize, queue.size());
            }
          }

          // Log queue statistics per page
          logger.info(`
Current: ${url}
Depth: ${depth}
Queue: ${queue.size()}
Visited: ${visited.size}
Queued: ${queued.size}
Links Found: ${links.length}
          `);

          if (!extracted) {
            logger.warn(`[${sessionId}] Skipping low-content page: ${url}`);
            await appendLog(`Skipped (low content): ${url}`);
            await patchSession(sessionId, { pagesSkipped: (sessionCache.pagesSkipped || 0) + 1 }, sessionCache);
          } else {
            crawledPages.push({ url: pageData.url, title: pageData.title, content: extracted.content });
            const pages = [...(sessionCache.pages || []), { url: pageData.url, title: pageData.title }];
            await patchSession(sessionId, { pages, pagesVisited: crawledPages.length }, sessionCache);
          }

          await delay(CRAWL_DELAY_MS);
        } catch (pageError) {
          if (pageError.message === 'STOP_PIPELINE') throw pageError;
          logger.warn(`[${sessionId}] Page failed after retries "${url}": ${pageError.message}`);
          await appendLog(`Failed: ${url} — ${pageError.message}`);
          await patchSession(sessionId, { pagesSkipped: (sessionCache.pagesSkipped || 0) + 1 }, sessionCache);
        }
      }
    } finally {
      await context.close();
    }

    const crawlDurationMs = Date.now() - crawlStart;
    const crawlDurationSec = (crawlDurationMs / 1000).toFixed(1);

    // Print summary debug metrics
    logger.info(`
--- CRAWL SUMMARY ---
Total pages crawled: ${visited.size}
Total unique URLs discovered: ${queued.size}
Duplicate URLs skipped: ${duplicateUrlsSkipped}
External URLs skipped: ${linkStats.externalUrlsSkipped}
Robots.txt blocked: ${robotsTxtBlocked}
Queue peak size: ${queuePeakSize}
Total crawl duration: ${crawlDurationSec} seconds
---------------------
    `);

    await appendLog(`Crawl complete — ${crawledPages.length} pages in ${crawlDurationSec}s`);

    if (crawledPages.length === 0) {
      await patchSession(sessionId, {
        status: SESSION_STATUS.FAILED,
        stage: PIPELINE_STAGES.CRAWLING,
        progress: 0,
        totalPages: 0,
        crawlDurationSec,
      }, sessionCache);
      logger.error(`[${sessionId}] Pipeline failed: no usable pages crawled.`);
      return;
    }

    await patchSession(sessionId, {
      totalPages: crawledPages.length,
      pagesVisited: crawledPages.length,
      progress: 30,
      crawlDurationSec,
    }, sessionCache);

    // ── Phase 2: Chunk ────────────────────────────────────────────────────────
    await patchSession(sessionId, { stage: PIPELINE_STAGES.CHUNKING, progress: 50 }, sessionCache);
    await appendLog(`Chunking ${crawledPages.length} pages...`);

    const allChunks = [];
    for (const page of crawledPages) {
      allChunks.push(...chunkText(page));
    }

    logger.info(`[${sessionId}] Chunking complete — ${allChunks.length} chunks`);
    await appendLog(`Chunking complete — ${allChunks.length} chunks created`);
    await patchSession(sessionId, { chunksCreated: allChunks.length, progress: 60 }, sessionCache);

    if (allChunks.length === 0) {
      await patchSession(sessionId, { status: SESSION_STATUS.FAILED, stage: PIPELINE_STAGES.CHUNKING }, sessionCache);
      logger.error(`[${sessionId}] Pipeline failed: no chunks produced.`);
      return;
    }

    // ── Phase 3: Embed ────────────────────────────────────────────────────────
    await patchSession(sessionId, { stage: PIPELINE_STAGES.EMBEDDING, progress: 60 }, sessionCache);
    await appendLog(`Generating embeddings for ${allChunks.length} chunks...`);

    let embeddedCount = 0;
    const embeddings = await generateEmbeddings(allChunks, async (completed, total) => {
      embeddedCount = completed;
      const embedProgress = 60 + Math.floor((completed / total) * 20);
      await patchSession(sessionId, {
        embeddingsCreated: completed,
        progress: Math.min(79, embedProgress),
      }, sessionCache);
    });

    logger.info(`[${sessionId}] Embeddings complete — ${embeddedCount} vectors`);
    await appendLog(`Embeddings complete — ${embeddedCount} vectors`);
    await patchSession(sessionId, { embeddingsCreated: embeddedCount, progress: 80 }, sessionCache);

    // ── Phase 4: Upsert ───────────────────────────────────────────────────────
    await patchSession(sessionId, { stage: PIPELINE_STAGES.INDEXING, progress: 80 }, sessionCache);
    await appendLog(`Storing ${allChunks.length} vectors in Qdrant...`);

    const validPairs = allChunks
      .map((chunk, i) => ({ chunk, vector: embeddings[i] }))
      .filter(({ vector }) => Array.isArray(vector) && vector.length > 0);

    if (validPairs.length === 0) {
      logger.error(`[${sessionId}] Pipeline failed: no valid vectors produced from ${allChunks.length} chunks.`);
      await appendLog(`Pipeline failed — no valid vectors produced.`);
      await patchSession(sessionId, {
        status: SESSION_STATUS.FAILED,
        stage: PIPELINE_STAGES.INDEXING,
        progress: 80,
        vectorsStored: 0,
      }, sessionCache);
      return;
    }

    try {
      await upsertChunks(sessionId, validPairs.map(p => p.chunk), validPairs.map(p => p.vector));
      logger.info(`[${sessionId}] Upserted ${validPairs.length} vectors`);
    } catch (upsertError) {
      logger.error(`[${sessionId}] Qdrant upsert failed: ${upsertError.message}`);
      await patchSession(sessionId, { status: SESSION_STATUS.FAILED, stage: PIPELINE_STAGES.INDEXING }, sessionCache);
      return;
    }

    const totalDurationSec = ((Date.now() - crawlStart) / 1000).toFixed(1);
    await appendLog(`Pipeline complete — ${validPairs.length} vectors stored in ${totalDurationSec}s`);

    // ── Phase 5: Ready ────────────────────────────────────────────────────────
    await patchSession(sessionId, {
      status: SESSION_STATUS.READY,
      stage: PIPELINE_STAGES.READY,
      progress: 100,
      vectorsStored: validPairs.length,
      currentPage: '',
      totalDurationSec,
    }, sessionCache);

    logger.info(`[${sessionId}] Pipeline complete in ${totalDurationSec}s — session is ready.`);
  } catch (error) {
    if (error.message === 'STOP_PIPELINE') {
      logger.info(`[${sessionId}] Pipeline gracefully cancelled by user.`);
      return;
    }
    logger.error(`[${sessionId}] Pipeline crash: ${error.message}`);
  }
}
