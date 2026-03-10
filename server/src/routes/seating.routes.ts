import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as seatingController from '../controllers/seating.controller';

const router = Router();

router.post('/:eventId/run', authenticate, seatingController.runSeating as any);

export default router;
