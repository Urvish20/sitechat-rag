import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import healthRouter from './routes/health.routes.js';
import sessionRouter from './routes/session.routes.js';
import chatRouter from './routes/chat.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const app = express();

app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

const allowedOrigins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin) {
      return callback(null, true);
    }

    const normalizedOrigin = requestOrigin.replace(/\/$/, '');
    if (allowedOrigins.includes('*') || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, requestOrigin);
    }

    return callback(new Error(`CORS origin denied: ${requestOrigin}`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/health', healthRouter);
app.use('/api/session', sessionRouter);
app.use('/api/chat', chatRouter);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
