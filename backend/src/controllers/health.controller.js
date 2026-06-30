import { sendSuccess } from '../utils/response.js';

export const checkHealth = (req, res) => {
  return sendSuccess(res, {
    message: 'Server is running',
  });
};
