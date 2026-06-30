import { z } from 'zod';

export const askQuestionSchema = z.object({
  body: z.object({
    sessionId: z.string({
      required_error: 'sessionId is required',
    }).uuid('Invalid sessionId format'),
    question: z.string({
      required_error: 'question is required',
    }).min(1, 'Question cannot be empty').max(1000, 'Question is too long'),
  }),
});
