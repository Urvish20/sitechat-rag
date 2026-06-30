import { v4 as uuidv4 } from 'uuid';
import { qdrantClient } from './qdrant.client.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const COLLECTION_NAME = env.QDRANT_COLLECTION;

/**
 * Returns true if the collection exists, false otherwise.
 */
export async function collectionExists() {
  try {
    const response = await qdrantClient.getCollections();
    const collections = response.collections.map((c) => c.name);
    return collections.includes(COLLECTION_NAME);
  } catch (error) {
    logger.error('Error checking if collection exists in Qdrant:', error);
    throw error;
  }
}

/**
 * Creates the collection if it does not already exist.
 * Uses Vector size 768 and Cosine similarity metric.
 */
export async function createCollection() {
  try {
    // Check if client is initialized
    if (!qdrantClient) {
      throw new Error('Qdrant Client is not initialized.');
    }

    // Try a ping/collection check to verify network/API key connection
    const exists = await collectionExists();

    if (exists) {
      logger.info('Collection already exists in Qdrant. Skipping creation.');
      return;
    }

    logger.info(`Creating collection "${COLLECTION_NAME}" in Qdrant Cloud...`);
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 768,
        distance: 'Cosine',
      },
    });

    logger.info(`✓ Collection "${COLLECTION_NAME}" created successfully.`);
  } catch (error) {
    logger.error('Error creating collection in Qdrant:', error);
    throw error;
  }
}

/**
 * Upserts text chunks and their embeddings into the Qdrant collection.
 * 
 * @param {string} sessionId - Associated crawl session uuid.
 * @param {Array<string|object>} chunks - Array of chunk texts or objects.
 * @param {Array<Array<number>>} embeddings - Array of 768-dim vector embeddings.
 */
export async function upsertChunks(sessionId, chunks, embeddings) {
  try {
    if (!chunks || !embeddings || chunks.length !== embeddings.length) {
      throw new Error('Chunks and embeddings must be non-empty arrays of equal length.');
    }

    const points = chunks.map((chunk, idx) => {
      const isObj = typeof chunk === 'object' && chunk !== null;
      
      const chunkText = isObj ? (chunk.chunkText || chunk.text || '') : chunk;
      const pageUrl = isObj ? (chunk.pageUrl || '') : '';
      const pageTitle = isObj ? (chunk.pageTitle || '') : '';
      const chunkIndex = isObj ? (chunk.chunkIndex ?? idx) : idx;

      return {
        id: uuidv4(),
        vector: embeddings[idx],
        payload: {
          sessionId,
          pageUrl,
          pageTitle,
          chunkText,
          chunkIndex,
        },
      };
    });

    logger.info(`Upserting ${points.length} points to Qdrant collection: "${COLLECTION_NAME}"`);
    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });
    
    logger.info('✓ Upsert complete.');
  } catch (error) {
    logger.error('Error upserting vectors to Qdrant:', error);
    throw error;
  }
}

/**
 * Searches Qdrant for similar chunks matching the query embedding,
 * filtered to only return items matching the specified sessionId.
 * 
 * @param {string} sessionId - Target session filter.
 * @param {Array<number>} queryEmbedding - 768-dim query embedding.
 * @param {number} limit - Max results to return.
 * @returns {Promise<Array<{score: number, payload: object}>>}
 */
export async function searchChunks(sessionId, queryEmbedding, limit = 5) {
  try {
    logger.info(`Searching vectors in session "${sessionId}" with limit: ${limit}`);
    
    const results = await qdrantClient.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit,
      filter: {
        must: [
          {
            key: 'sessionId',
            match: {
              value: sessionId,
            },
          },
        ],
      },
    });

    return results.map((point) => ({
      score: point.score,
      payload: point.payload,
    }));
  } catch (error) {
    logger.error('Error searching vectors in Qdrant:', error);
    throw error;
  }
}

/**
 * Deletes all vectors matching a specific sessionId.
 */
export async function deleteSessionVectors(sessionId) {
  try {
    logger.info(`Deleting all vectors for session "${sessionId}" from collection "${COLLECTION_NAME}"`);
    await qdrantClient.delete(COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: 'sessionId',
            match: {
              value: sessionId,
            },
          },
        ],
      },
    });
    logger.info(`✓ Vectors for session "${sessionId}" deleted.`);
  } catch (error) {
    logger.error(`Error deleting session "${sessionId}" vectors from Qdrant:`, error);
    throw error;
  }
}

/**
 * Deletes the entire collection.
 */
export async function deleteCollection() {
  try {
    logger.info(`Deleting collection "${COLLECTION_NAME}" from Qdrant...`);
    await qdrantClient.deleteCollection(COLLECTION_NAME);
    logger.info(`✓ Collection "${COLLECTION_NAME}" deleted.`);
  } catch (error) {
    logger.error(`Error deleting collection "${COLLECTION_NAME}" from Qdrant:`, error);
    throw error;
  }
}
