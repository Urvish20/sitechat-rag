
export const sendSuccess = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...data
  });
};

export const sendError = (res, message, errorCode = 'INTERNAL_ERROR', details = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      ...(details && { details })
    }
  });
};
