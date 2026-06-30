import { generateEmbedding } from '../embedding/geminiEmbedding.js';
import { searchChunks } from '../vector/qdrant.service.js';
import { logger } from '../../utils/logger.js';

const SIMILARITY_THRESHOLD = 0.70;
const TOP_K = 5;

/**
 * Embeds the user question, searches Qdrant for the top-K similar chunks
 * in the given session, and returns structured context results.
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
    logger.warn(`[retriever] No results found in Qdrant for session "${sessionId}"`);
    return [];
  }

  const best = results[0].score;
  logger.info(`[retriever] Best similarity score: ${best.toFixed(4)}`);

  if (best < SIMILARITY_THRESHOLD) {
    logger.warn(`[retriever] Score ${best.toFixed(4)} below threshold ${SIMILARITY_THRESHOLD} — skipping.`);
    return [];
  }

  return results.map(({ score, payload }) => ({
    score,
    pageUrl: payload.pageUrl ?? '',
    pageTitle: payload.pageTitle ?? '',
    chunkText: payload.chunkText ?? '',
  }));
}
