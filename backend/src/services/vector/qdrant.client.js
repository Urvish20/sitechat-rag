import { QdrantClient } from '@qdrant/js-client-rest';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

let qdrantClient;

try {
  qdrantClient = new QdrantClient({
    url: env.QDRANT_URL,
    apiKey: env.QDRANT_API_KEY,
  });
} catch (error) {
  logger.error('Failed to initialize Qdrant Client singleton instance:', error);
  process.exit(1);
}

export { qdrantClient };
