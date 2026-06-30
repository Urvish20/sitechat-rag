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
    enum: ['processing', 'ready', 'completed', 'failed'],
    default: 'processing',
  },
  stage: {
    type: String,
    required: true,
    default: 'Starting',
  },
  currentStep: {
    type: String,
    default: 'Starting',
  },
  progress: {
    type: Number,
    required: true,
    default: 0,
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
  pagesSkipped: {
    type: Number,
    default: 0,
  },
  chunksCreated: {
    type: Number,
    default: 0,
  },
  embeddingsCreated: {
    type: Number,
    default: 0,
  },
  vectorsStored: {
    type: Number,
    default: 0,
  },
  crawlDurationSec: {
    type: Number,
    default: null,
  },
  totalDurationSec: {
    type: Number,
    default: null,
  },
  logs: {
    type: Array,
    default: [],
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
