import { v4 as uuidv4 } from 'uuid';
import { sessionStore } from './session.store.js';
import { SESSION_STATUS, MOCK_STEPS } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';

class SessionService {
  constructor() {
    this.activeIntervals = new Map();
  }

  async createSession(url) {
    const sessionId = uuidv4();
    const session = {
      sessionId,
      url,
      status: SESSION_STATUS.PROCESSING,
      progress: 0,
      currentStep: MOCK_STEPS[0],
      createdAt: new Date(),
    };

    await sessionStore.set(sessionId, session);
    logger.info(`Session created: ${sessionId} for URL: ${url}`);

    this.simulateIndexing(sessionId);

    return {
      sessionId,
      status: session.status,
    };
  }

  async getSessionStatus(id) {
    const session = await sessionStore.get(id);
    if (!session) return null;

    return {
      sessionId: session.sessionId || session.id, // compatibility support
      status: session.status,
      progress: session.progress,
      currentStep: session.currentStep,
    };
  }

  async deleteSession(id) {
    const exists = await sessionStore.has(id);
    if (!exists) return false;

    const intervalId = this.activeIntervals.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      this.activeIntervals.delete(id);
    }

    await sessionStore.delete(id);
    logger.info(`Session deleted: ${id}`);
    return true;
  }

  simulateIndexing(id) {
    let progress = 0;

    const intervalId = setInterval(async () => {
      const session = await sessionStore.get(id);
      if (!session) {
        clearInterval(intervalId);
        this.activeIntervals.delete(id);
        return;
      }

      progress += 10;
      if (progress >= 100) {
        progress = 100;
        session.status = SESSION_STATUS.COMPLETED;
        session.currentStep = 'Search Index Built';
        session.progress = 100;

        clearInterval(intervalId);
        this.activeIntervals.delete(id);
        logger.info(`Session indexing completed: ${id}`);
      } else {
        session.progress = progress;

        // Map progress to steps
        const stepIndex = Math.min(
          Math.floor((progress / 100) * MOCK_STEPS.length),
          MOCK_STEPS.length - 1
        );
        session.currentStep = MOCK_STEPS[stepIndex];
      }

      await sessionStore.set(id, session);
    }, 400); // 4 seconds total to index

    this.activeIntervals.set(id, intervalId);
  }
}

export const sessionService = new SessionService();
