export const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

export const SESSION_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  READY: 'ready',
  FAILED: 'failed'
};

export const PIPELINE_STAGES = {
  STARTING: 'Starting',
  CRAWLING: 'Crawling Website',
  CLEANING: 'Cleaning HTML',
  EXTRACTING: 'Extracting Content',
  CHUNKING: 'Chunking',
  EMBEDDING: 'Generating Embeddings',
  INDEXING: 'Indexing into Qdrant',
  READY: 'Ready',
};

export const MOCK_STEPS = [
  'Crawling Website',
  'Extracting Content',
  'Cleaning HTML',
  'Chunking Content',
  'Creating Embeddings',
  'Building Search Index'
];
