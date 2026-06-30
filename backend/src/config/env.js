import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5174'),
  MONGO_DB_URL: z.string().optional(),
  QDRANT_URL: z.string({ required_error: 'QDRANT_URL is required' }).min(1, 'QDRANT_URL cannot be empty'),
  QDRANT_API_KEY: z.string({ required_error: 'QDRANT_API_KEY is required' }).min(1, 'QDRANT_API_KEY cannot be empty'),
  QDRANT_COLLECTION: z.string().default('sitechat'),
  GEMINI_API_KEY: z
    .string({ required_error: 'GEMINI_API_KEY is required' })
    .min(10, 'GEMINI_API_KEY appears invalid — check your Google AI Studio key'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Environment configuration error:');
  const issues = parsedEnv.error.issues;
  issues.forEach((issue) => {
    console.error(`   • ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsedEnv.data;
