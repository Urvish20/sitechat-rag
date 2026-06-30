import { z } from 'zod';

export const createSessionSchema = z.object({
  body: z.object({
    url: z.string({
      required_error: 'URL is required',
    })
    .url('Please enter a valid website URL (e.g., https://example.com)')
    .trim(),
  }),
});

export const getSessionStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid session ID format'),
  }),
});

export const deleteSessionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid session ID format'),
  }),
});
