import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant'],
  },
  text: {
    type: String,
    required: true,
  },
  sources: [{
    title: { type: String, required: true },
    url: { type: String, required: true }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export const Chat = mongoose.model('Chat', chatSchema);
