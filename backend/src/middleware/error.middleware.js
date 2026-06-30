import { sendError } from '../utils/response.js';
import { ERROR_CODES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

/**
 * Express middleware to catch and format unhandled exceptions.
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - Error:`, err);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;
  const message = err.message || 'An internal server error occurred';
  
  const details = process.env.NODE_ENV === 'development' 
    ? { stack: err.stack } 
    : null;

  return sendError(res, message, errorCode, details, statusCode);
};

/**
 * Fallback middleware for unmapped routing definitions (404 Not Found).
 */
export const notFoundHandler = (req, res, next) => {
  return sendError(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    ERROR_CODES.NOT_FOUND,
    null,
    404
  );
};
