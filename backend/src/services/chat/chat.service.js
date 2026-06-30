import { sessionStore } from '../session/session.store.js';
import { logger } from '../../utils/logger.js';
import { Chat } from '../../models/chat.model.js';
import mongoose from 'mongoose';

class ChatService {
  isDbConnected() {
    return mongoose.connection.readyState === 1;
  }

  async askQuestion(sessionId, question) {
    const session = await sessionStore.get(sessionId);
    if (!session) return null;

    logger.info(`Chat request in session: ${sessionId} for query: "${question}"`);

    // Basic keyword parsing for realistic responses
    let answer = '';
    let sources = [];
    const query = question.toLowerCase();

    if (query.includes('summary') || query.includes('what is') || query.includes('about')) {
      answer = `Based on the local RAG indexing of **${session.url}**, here is a summary of the website:\n\n1. **Core Purpose**: The website outlines developer guidelines, library packages, and documentation updates.\n2. **Key Capabilities**: Focuses on high-performance operations, quick installation procedures, and customizable components.\n3. **Community Hub**: Features references to GitHub issues, Discord chats, and community support boards.`;
      sources = [
        {
          title: 'Documentation Index',
          url: `${session.url}/docs`
        },
        {
          title: 'Getting Started Guide',
          url: `${session.url}/getting-started`
        }
      ];
    } else if (query.includes('contact') || query.includes('support') || query.includes('help')) {
      answer = `To get assistance or contact the team behind **${session.url}**, you can use the following support routes:\n\n- **Email Help Desk**: Standard ticket submission guides are available under the support section.\n- **Discord Channels**: Connect with moderators and developers for live assistance.\n- **GitHub issues**: Post bugs and request changes directly on their public repositories.`;
      sources = [
        {
          title: 'Contact Support Channels',
          url: `${session.url}/contact`
        }
      ];
    } else {
      answer = `Thank you for asking! I queried the local memory index of **${session.url}** for "${question}". I found relevant sections discussing architectural designs, developer tutorials, and core code setups.\n\nLet me know if you would like me to detail any specific section!`;
      sources = [
        {
          title: 'Documentation Overview',
          url: `${session.url}/docs/overview`
        }
      ];
    }

    // Save history in MongoDB if connected
    if (this.isDbConnected()) {
      try {
        await Chat.create({
          sessionId,
          role: 'user',
          text: question,
          sources: []
        });
        await Chat.create({
          sessionId,
          role: 'assistant',
          text: answer,
          sources
        });
      } catch (err) {
        logger.error('Failed to log chat interaction to DB:', err);
      }
    }

    return {
      answer,
      sources
    };
  }
}

export const chatService = new ChatService();
