import { Router } from 'express';
import { askQuestion } from '../controllers/chat.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { askQuestionSchema } from '../validators/chat.validator.js';

const router = Router();

router.post('/', validate(askQuestionSchema), askQuestion);

export default router;
