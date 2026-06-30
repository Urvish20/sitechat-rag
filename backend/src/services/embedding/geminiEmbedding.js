import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

/**
 * @param {string} text - Input text to embed.
 * @returns {Promise<number[]>} Embedding vector array.
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('generateEmbedding: text must be a non-empty string.');
  }

  const result = await embeddingModel.embedContent(text.trim());
  return result.embedding.values;
}

/**
 *
 * @param {Array<object>} chunks - Array of chunk objects containing a `text` field.
 * @param {Function} [onProgress] - Optional callback invoked after each embedding: (completed, total) => void
 * @returns {Promise<Array<number[]>>} Array of embedding vectors in the same order as chunks.
 */
export async function generateEmbeddings(chunks, onProgress) {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return [];
  }

  const embeddings = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const text = chunk.text || chunk.chunkText || '';

    if (!text.trim()) {
      embeddings.push([]);
      continue;
    }

    try {
      const vector = await generateEmbedding(text);
      embeddings.push(vector);
      logger.info(`Embedded chunk ${i + 1}/${chunks.length}`);

      if (typeof onProgress === 'function') {
        onProgress(i + 1, chunks.length);
      }

      if (i < chunks.length - 1) {
        await new Promise((r) => setTimeout(r, 100));
      }
    } catch (error) {
      logger.error(`Failed to embed chunk ${i + 1}:`, error.message);
      embeddings.push([]);
    }
  }

  return embeddings;
}
