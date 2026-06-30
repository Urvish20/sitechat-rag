/**
 * Wraps express routes handlers to catch async errors and pass them to the global handler.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
