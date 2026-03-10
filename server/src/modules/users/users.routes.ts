import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateProfileSchema } from './user.schemas';
import * as svc from './user.service';

const router = Router();

// GET /api/v1/users/me
router.get('/me', authenticate, async (req: Request, res: Response) => {
  const data = await svc.getProfile(req.user!.userId);
  res.json({ success: true, data });
});

// PATCH /api/v1/users/me
router.patch('/me', authenticate, validate(updateProfileSchema), async (req: Request, res: Response) => {
  const data = await svc.updateProfile(req.user!.userId, req.body);
  res.json({ success: true, data });
});

// GET /api/v1/users/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const data = await svc.getUserPublicProfile(req.params.id);
  res.json({ success: true, data });
});

// GET /api/v1/users/me/score-history
router.get('/me/score-history', authenticate, async (req: Request, res: Response) => {
  const data = await svc.getScoreHistory(req.user!.userId);
  res.json({ success: true, data });
});

export default router;
