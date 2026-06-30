import { chatService } from '../services/chat/chat.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ERROR_CODES } from '../utils/constants.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const askQuestion = asyncHandler(async (req, res) => {
  const { sessionId, question } = req.body;
  const result = await chatService.askQuestion(sessionId, question);

  if (!result) {
    return sendError(
      res,
      `Session not found or inactive with ID: ${sessionId}`,
      ERROR_CODES.NOT_FOUND,
      null,
      404
    );
  }

  return sendSuccess(res, result);
});
