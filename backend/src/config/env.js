import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5174'),
  MONGO_DB_URL: z.string().optional(),
  QDRANT_URL: z.string({ required_error: 'QDRANT_URL is required' }),
  QDRANT_API_KEY: z.string({ required_error: 'QDRANT_API_KEY is required' }),
  QDRANT_COLLECTION: z.string().default('sitechat'),
  GEMINI_API_KEY: z.string({ required_error: 'GEMINI_API_KEY is required' }),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
