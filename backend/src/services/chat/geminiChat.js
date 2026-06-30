import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 *
 * @param {string} prompt - Complete grounded prompt string.
 * @returns {Promise<string>} Raw answer text from Gemini.
 */
export async function askGemini(prompt) {
  logger.info('[geminiChat] Sending prompt to Gemini...');

  const result = await chatModel.generateContent(prompt);
  const response = result.response;
  const text = response.text().trim();

  logger.info('[geminiChat] Received answer from Gemini.');
  return text;
}
