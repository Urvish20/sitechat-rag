import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

/**
 * Generates a 768-dimensional embedding vector for the given text.
 * Uses gemini-embedding-001 with outputDimensionality configuration.
 *
 * @param {string} text - Input text to embed.
 * @returns {Promise<number[]>} Embedding vector array.
 */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function generateEmbedding(text, retries = 5, backoff = 2000) {
  if (!text || typeof text !== 'string') {
    throw new Error('generateEmbedding: text must be a non-empty string.');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await embeddingModel.embedContent({
        content: { parts: [{ text: text.trim() }] },
        outputDimensionality: 768,
      });

      return result.embedding.values;
    } catch (error) {
      const errMsg = error.message || '';
      const isRateLimit = errMsg.includes('429') || 
                          errMsg.toLowerCase().includes('too many requests') || 
                          errMsg.toLowerCase().includes('quota');

      if (isRateLimit && attempt < retries) {
        const waitTime = backoff * Math.pow(2, attempt - 1);
        logger.warn(`Gemini Embedding Rate Limit hit (429). Retrying in ${(waitTime / 1000).toFixed(1)}s (attempt ${attempt}/${retries})...`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
}

/**
 * Generates embeddings for an array of chunk objects.
 *
 * @param {Array<object>} chunks - Array of chunk objects containing a `text` field.
 * @param {Function} [onProgress] - Optional callback invoked after each embedding.
 * @returns {Promise<Array<number[]>>} Array of embedding vectors.
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
