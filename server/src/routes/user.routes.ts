import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema } from '../schemas/user.schemas';
import * as userController from '../controllers/user.controller';

const router = Router();

router.get ('/me',               authenticate, userController.getMe as any);
router.patch('/me',              authenticate, validate(updateProfileSchema), userController.updateMe as any);
router.get ('/me/score-history', authenticate, userController.getMyScoreHistory as any);
router.get ('/:id',              authenticate, userController.getPublicProfile as any);

export default router;
