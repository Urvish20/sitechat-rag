import { sessionService } from '../services/session/session.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ERROR_CODES } from '../utils/constants.js';
import { asyncHandler } from '../middleware/asyncHandler.js';


export const createSession = asyncHandler(async (req, res) => {
  const { url } = req.body;
  const result = await sessionService.createSession(url);

  return sendSuccess(res, result, 201);
});

export const getSessionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const statusData = await sessionService.getSessionStatus(id);

  if (!statusData) {
    return sendError(
      res,
      `Session not found with ID: ${id}`,
      ERROR_CODES.NOT_FOUND,
      null,
      404
    );
  }

  return sendSuccess(res, statusData);
});


export const deleteSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await sessionService.deleteSession(id);

  if (!deleted) {
    return sendError(
      res,
      `Session not found with ID: ${id}`,
      ERROR_CODES.NOT_FOUND,
      null,
      404
    );
  }

  return sendSuccess(res, { message: 'Session deleted successfully' });
});
