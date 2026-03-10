import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { queryOne } from '../../db/postgres/client';
import { ForbiddenError, NotFoundError } from '../../middleware/errorHandler';
import { runSeatAlgorithm } from './seating.algorithm';

const router = Router();

// POST /api/v1/seating/:eventId/run
router.post('/:eventId/run', authenticate, async (req: Request, res: Response) => {
  const event = await queryOne<{ planner_id: string; score_influence: string }>(
    `SELECT planner_id, score_influence FROM events WHERE id = $1`, [req.params.eventId]
  );
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== req.user!.userId) throw new ForbiddenError();

  const result = await runSeatAlgorithm(req.params.eventId, {
    useScoreInfluence: event.score_influence !== 'off',
  });

  res.json({ success: true, data: result });
});

export default router;
