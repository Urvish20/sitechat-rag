import { Session } from '../../models/session.model.js';
import mongoose from 'mongoose';

/**
 * Session storage layer that dynamically selects between MongoDB and in-memory storage.
 */
class SessionStore {
  constructor() {
    this.inMemorySessions = new Map();
  }

  isDbConnected() {
    return mongoose.connection.readyState === 1;
  }

  async get(id) {
    if (this.isDbConnected()) {
      try {
        return await Session.findOne({ sessionId: id }).lean();
      } catch (err) {
        console.error('Error fetching session from DB:', err);
      }
    }
    return this.inMemorySessions.get(id);
  }

  async set(id, session) {
    if (this.isDbConnected()) {
      try {
        await Session.findOneAndUpdate(
          { sessionId: id },
          session,
          { upsert: true, new: true }
        );
        return;
      } catch (err) {
        console.error('Error writing session to DB:', err);
      }
    }
    this.inMemorySessions.set(id, session);
  }

  async delete(id) {
    if (this.isDbConnected()) {
      try {
        const result = await Session.deleteOne({ sessionId: id });
        return result.deletedCount > 0;
      } catch (err) {
        console.error('Error deleting session from DB:', err);
        return false;
      }
    }
    return this.inMemorySessions.delete(id);
  }

  async has(id) {
    if (this.isDbConnected()) {
      try {
        const count = await Session.countDocuments({ sessionId: id });
        return count > 0;
      } catch (err) {
        console.error('Error checking session from DB:', err);
        return false;
      }
    }
    return this.inMemorySessions.has(id);
  }

  async list() {
    if (this.isDbConnected()) {
      try {
        return await Session.find({}).lean();
      } catch (err) {
        console.error('Error listing sessions from DB:', err);
        return [];
      }
    }
    return Array.from(this.inMemorySessions.values());
  }
}

export const sessionStore = new SessionStore();
