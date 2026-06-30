import { generateEmbedding } from '../embedding/geminiEmbedding.js';
import { searchChunks } from '../vector/qdrant.service.js';
import { logger } from '../../utils/logger.js';

const SIMILARITY_THRESHOLD = 0.70;
const SECONDARY_THRESHOLD = 0.65;
const TOP_K = 8;

/**
 * Creates a short fingerprint from a text string for deduplication.
 * Uses the first 120 chars normalized to lowercase with collapsed whitespace.
 *
 * @param {string} text
 * @returns {string}
 */
function textFingerprint(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 120);
}

/**
 * Embeds the user question, searches Qdrant for the top-K similar chunks,
 * deduplicates by text fingerprint, and filters by similarity threshold.
 *
 * @param {string} sessionId - Session to scope the search.
 * @param {string} question  - User's raw question text.
 * @returns {Promise<Array<{score: number, pageUrl: string, pageTitle: string, chunkText: string}>>}
 *          Empty array when best score is below SIMILARITY_THRESHOLD.
 */
export async function retrieve(sessionId, question) {
  logger.info(`[retriever] Embedding question for session "${sessionId}"`);

  const queryVector = await generateEmbedding(question);

  logger.info(`[retriever] Searching Qdrant (top ${TOP_K}) for session "${sessionId}"`);
  const results = await searchChunks(sessionId, queryVector, TOP_K);

  if (results.length === 0) {
    logger.warn(`[retriever] No Qdrant results for session "${sessionId}"`);
    return [];
  }

  const best = results[0].score;
  logger.info(`[retriever] Best similarity score: ${best.toFixed(4)}`);

  if (best < SIMILARITY_THRESHOLD) {
    logger.warn(`[retriever] Best score ${best.toFixed(4)} below threshold — no results returned.`);
    return [];
  }

  // Deduplicate by text fingerprint and apply secondary score filter
  const seen = new Set();
  const deduplicated = [];

  for (const { score, payload } of results) {
    if (score < SECONDARY_THRESHOLD) continue;

    const chunkText = payload.chunkText ?? '';
    const fp = textFingerprint(chunkText);

    if (seen.has(fp)) {
      logger.debug(`[retriever] Skipping duplicate chunk (score: ${score.toFixed(4)})`);
      continue;
    }

    seen.add(fp);
    deduplicated.push({
      score,
      pageUrl: payload.pageUrl ?? '',
      pageTitle: payload.pageTitle ?? '',
      chunkText,
    });
  }

  logger.info(`[retriever] Returning ${deduplicated.length} unique chunks (from ${results.length} raw results)`);
  return deduplicated;
}
