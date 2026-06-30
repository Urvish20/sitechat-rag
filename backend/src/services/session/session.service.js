import { v4 as uuidv4 } from 'uuid';
import { sessionStore } from './session.store.js';
import { crawlWebsite } from '../crawler/crawlWebsite.js';
import { SESSION_STATUS } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';

class SessionService {
  /**
   * Initializes a session, triggers the background crawl operation,
   * and returns the status metadata immediately.
   */
  async createSession(url) {
    const sessionId = uuidv4();
    
    const session = {
      sessionId,
      url,
      status: SESSION_STATUS.PROCESSING,
      progress: 0,
      currentStep: 'Crawling Website',
      currentPage: '',
      pagesVisited: 0,
      totalPages: 0,
      pages: [],
      createdAt: new Date(),
    };

    // Save initial session state
    await sessionStore.set(sessionId, session);
    logger.info(`Initialized session ${sessionId} for URL: ${url}`);

    // Trigger crawlWebsite asynchronously in the background.
    // Do NOT await it, ensuring the client receives a response immediately.
    crawlWebsite(sessionId, url).catch((err) => {
      logger.error(`Unhandled error during crawling process for session ${sessionId}:`, err);
    });

    return {
      sessionId,
      status: session.status,
    };
  }

  /**
   * Fetches active session metadata details.
   */
  async getSessionStatus(id) {
    const session = await sessionStore.get(id);
    if (!session) return null;

    return {
      sessionId: session.sessionId || session.id,
      status: session.status,
      progress: session.progress ?? 0,
      currentPage: session.currentPage ?? '',
      pagesVisited: session.pagesVisited ?? 0,
      totalPages: session.totalPages ?? 0,
    };
  }

  /**
   * Cleans up and deletes active session records.
   */
  async deleteSession(id) {
    const exists = await sessionStore.has(id);
    if (!exists) return false;

    // Remove from active store
    await sessionStore.delete(id);
    logger.info(`Session index removed: ${id}`);
    return true;
  }
}

export const sessionService = new SessionService();
