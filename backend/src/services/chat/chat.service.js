import { retrieve } from './retriever.js';
import { buildPrompt } from './promptBuilder.js';
import { askGemini } from './geminiChat.js';
import { sessionStore } from '../session/session.store.js';
import { logger } from '../../utils/logger.js';

const FALLBACK_ANSWER = "I couldn't find that information in the crawled website.";

class ChatService {
  /**
   * Full RAG pipeline: retrieve → prompt → generate → return.
   *
   * @param {string} sessionId - Active session ID.
   * @param {string} question  - User question.
   * @returns {Promise<{answer: string, sources: Array<{pageTitle: string, pageUrl: string, score: number}>> | null>}
   *          Returns null if the session does not exist.
   */
  async askQuestion(sessionId, question) {
    const session = await sessionStore.get(sessionId);
    if (!session) {
      logger.warn(`[chatService] Session not found: ${sessionId}`);
      return null;
    }

    logger.info(`[chatService] Processing question for session "${sessionId}": "${question}"`);

    // Step 1 — Retrieve relevant chunks from Qdrant
    let chunks;
    try {
      chunks = await retrieve(sessionId, question);
    } catch (err) {
      logger.error('[chatService] Retrieval failed:', err.message);
      return { answer: FALLBACK_ANSWER, sources: [] };
    }

    // No relevant context found or below similarity threshold
    if (!chunks || chunks.length === 0) {
      logger.warn('[chatService] No relevant context found. Returning fallback answer.');
      return { answer: FALLBACK_ANSWER, sources: [] };
    }

    // Step 2 — Build grounded prompt
    const prompt = buildPrompt(chunks, question);

    // Step 3 — Ask Gemini
    let answer;
    try {
      answer = await askGemini(prompt);
    } catch (err) {
      logger.error('[chatService] Gemini generation failed:', err.message);
      return { answer: 'An error occurred while generating the answer. Please try again.', sources: [] };
    }

    // Step 4 — Deduplicate and format sources
    const seenUrls = new Set();
    const sources = chunks
      .filter(({ pageUrl }) => {
        if (seenUrls.has(pageUrl)) return false;
        seenUrls.add(pageUrl);
        return true;
      })
      .map(({ pageTitle, pageUrl, score }) => ({
        pageTitle,
        pageUrl,
        score: Math.round(score * 100) / 100,
      }));

    logger.info(`[chatService] Returning answer with ${sources.length} unique sources.`);

    return { answer, sources };
  }
}

export const chatService = new ChatService();
