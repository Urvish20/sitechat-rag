import mongoose from 'mongoose';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { createCollection } from './services/vector/qdrant.service.js';

// Connect to Qdrant Cloud
try {
  await createCollection();
  console.log('✓ Connected to Qdrant Cloud');
  console.log('✓ Collection Ready');
} catch (error) {
  logger.error('CRITICAL: Failed to initialize Qdrant. Shutting down server:', error.message);
  process.exit(1);
}

// Connect to MongoDB database if connection string is configured
if (env.MONGO_DB_URL) {
  mongoose.connect(env.MONGO_DB_URL)
    .then(() => logger.info('Successfully connected to MongoDB database.'))
    .catch((err) => {
      logger.error('MongoDB database connection failed. Falling back to in-memory mode.', err);
    });
} else {
  logger.warn('MONGO_DB_URL environment variable is not defined. Active sessions will store in local-memory.');
}

const server = app.listen(env.PORT, () => {
  logger.info(`=================================================`);
  logger.info(`🚀 SiteChat Service running in ${env.NODE_ENV} mode`);
  logger.info(`🔗 Listening on: http://localhost:${env.PORT}`);
  logger.info(`=================================================`);
});

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down server gracefully...`);

  server.close(() => {
    logger.info('HTTP server terminated.');

    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close()
        .then(() => {
          logger.info('MongoDB database connection closed.');
          process.exit(0);
        })
        .catch((err) => {
          logger.error('Error closing MongoDB connection:', err);
          process.exit(1);
        });
    } else {
      process.exit(0);
    }
  });

  // Force close after 10s if connections persist
  setTimeout(() => {
    logger.warn('Forcing shutdown due to active connections.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception! Process crashing...', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
