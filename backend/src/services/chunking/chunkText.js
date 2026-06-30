import { v4 as uuidv4 } from 'uuid';
import { splitIntoChunks, cleanChunk } from './chunkUtils.js';
import { logger } from '../../utils/logger.js';

const MIN_CHUNK_LENGTH = 20;

/**
 * Splits page content into structured chunk objects for embedding.
 * Filters out chunks shorter than MIN_CHUNK_LENGTH characters.
 *
 * @param {object} page         - Extracted page data.
 * @param {string} page.url     - Page URL.
 * @param {string} page.title   - Page title.
 * @param {string} page.content - Clean text content.
 * @returns {Array<object>} Structured chunk objects.
 */
export function chunkText(page) {
  const { url, title, content } = page;
  if (!content) return [];

  const rawChunks = splitIntoChunks(content, 1000, 200);

  const finalChunks = rawChunks
    .map(cleanChunk)
    .filter((chunk) => chunk.length >= MIN_CHUNK_LENGTH)
    .map((text, index) => ({
      id: uuidv4(),
      pageUrl: url,
      pageTitle: title,
      chunkIndex: index,
      text,
    }));

  logger.info(`Chunked "${url}" — ${content.length} chars → ${finalChunks.length} chunks`);

  return finalChunks;
}
