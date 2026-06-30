import { v4 as uuidv4 } from 'uuid';
import { sessionStore } from './session.store.js';
import { crawlWebsite } from '../crawler/crawlWebsite.js';
import { deleteSessionVectors } from '../vector/qdrant.service.js';
import { SESSION_STATUS, PIPELINE_STAGES } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';

class SessionService {
  /**
   * Initializes a session, triggers the background crawl + embed pipeline,
   * and returns the session ID immediately.
   */
  async createSession(url) {
    const sessionId = uuidv4();

    const session = {
      sessionId,
      url,
      status: SESSION_STATUS.PROCESSING,
      stage: PIPELINE_STAGES.STARTING,
      progress: 0,
      currentPage: '',
      pagesVisited: 0,
      totalPages: 0,
      chunksCreated: 0,
      embeddingsCreated: 0,
      vectorsStored: 0,
      pages: [],
      createdAt: new Date(),
    };

    await sessionStore.set(sessionId, session);
    logger.info(`Initialized session ${sessionId} for URL: ${url}`);

    crawlWebsite(sessionId, url).catch((err) => {
      logger.error(`Unhandled pipeline error for session ${sessionId}:`, err);
    });

    return { sessionId, status: session.status };
  }

  /**
   * Returns the full status and progress metadata for a session.
   */
  async getSessionStatus(id) {
    const session = await sessionStore.get(id);
    if (!session) return null;

    return {
      sessionId: session.sessionId || id,
      status: session.status,
      stage: session.stage ?? PIPELINE_STAGES.STARTING,
      progress: session.progress ?? 0,
      currentPage: session.currentPage ?? '',
      pagesVisited: session.pagesVisited ?? 0,
      totalPages: session.totalPages ?? 0,
      pagesSkipped: session.pagesSkipped ?? 0,
      chunksCreated: session.chunksCreated ?? 0,
      embeddingsCreated: session.embeddingsCreated ?? 0,
      vectorsStored: session.vectorsStored ?? 0,
      crawlDurationSec: session.crawlDurationSec ?? null,
      totalDurationSec: session.totalDurationSec ?? null,
      logs: session.logs ?? [],
    };
  }

  /**
   * Deletes a session record.
   */
  async deleteSession(id) {
    const exists = await sessionStore.has(id);
    if (!exists) return false;

    try {
      await deleteSessionVectors(id);
    } catch (err) {
      logger.warn(`[sessionService] Could not delete Qdrant vectors for session ${id}:`, err.message);
    }

    await sessionStore.delete(id);
    logger.info(`Session removed: ${id}`);
    return true;
  }
}

export const sessionService = new SessionService();
