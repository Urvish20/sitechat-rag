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

app.use(cors({
  origin: env.CORS_ORIGIN,
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
