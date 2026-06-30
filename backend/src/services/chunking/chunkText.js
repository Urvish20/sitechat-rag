import { v4 as uuidv4 } from 'uuid';
import { splitIntoChunks, cleanChunk } from './chunkUtils.js';

/**
 * Splits page data containing url, title, and content into an array of 1000-char chunks
 * with a 200-char context overlap. Generates unique IDs and logs operations.
 * 
 * @param {object} page - Extracted page details.
 * @param {string} page.url - Page URL.
 * @param {string} page.title - Page title.
 * @param {string} page.content - Clean text content.
 * @returns {Array<object>} List of structured chunk objects.
 */
export function chunkText(page) {
  const { url, title, content } = page;
  if (!content) return [];

  const rawChunks = splitIntoChunks(content, 1000, 200);
  
  const finalChunks = rawChunks
    .map(cleanChunk)
    .filter((chunk) => chunk.length > 0)
    .map((chunkText, index) => ({
      id: uuidv4(),
      pageUrl: url,
      pageTitle: title,
      chunkIndex: index,
      text: chunkText,
    }));

  console.log(`Processing\n${url}`);
  console.log(`Content Length\n${content.length} characters`);
  console.log(`Generated\n${finalChunks.length} chunks`);

  return finalChunks;
}
