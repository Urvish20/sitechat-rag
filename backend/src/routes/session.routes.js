import { Router } from 'express';
import { createSession, getSessionStatus, deleteSession } from '../controllers/session.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { createSessionSchema, getSessionStatusSchema, deleteSessionSchema } from '../validators/session.validator.js';

const router = Router();

router.post('/', validate(createSessionSchema), createSession);
router.get('/:id/status', validate(getSessionStatusSchema), getSessionStatus);
router.delete('/:id', validate(deleteSessionSchema), deleteSession);

export default router;
