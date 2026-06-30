import { sendError } from '../utils/response.js';
import { ERROR_CODES } from '../utils/constants.js';

/**
 * Express middleware to validate request structures against Zod schemas.
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Assign validated data back
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    
    return next();
  } catch (error) {
    const details = error.errors.map((err) => ({
      field: err.path.slice(1).join('.'),
      message: err.message,
    }));
    
    return sendError(
      res,
      'Validation failed',
      ERROR_CODES.VALIDATION_ERROR,
      details,
      400
    );
  }
};
