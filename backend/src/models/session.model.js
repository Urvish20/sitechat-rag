import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
  },
  progress: {
    type: Number,
    required: true,
    default: 0,
  },
  currentStep: {
    type: String,
    required: true,
    default: 'Crawling Website',
  },
  currentPage: {
    type: String,
    default: '',
  },
  pagesVisited: {
    type: Number,
    default: 0,
  },
  totalPages: {
    type: Number,
    default: 0,
  },
  pages: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // automatic collection cleanup in 24 hours
  }
});

export const Session = mongoose.model('Session', sessionSchema);
