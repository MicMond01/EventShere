import { Router, Request, Response } from 'express';
import { query, queryOne } from '../../db/postgres/client';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/v1/notifications — get my notifications
router.get('/', authenticate, async (req: Request, res: Response) => {
  const page  = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  const rows = await query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [req.user!.userId, limit, offset]
  );

  const [{ count }] = await query<{ count: string }>(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1`, [req.user!.userId]
  ) as any;

  res.json({ success: true, data: rows, total: Number(count) });
});

// GET /api/v1/notifications/unread-count
router.get('/unread-count', authenticate, async (req: Request, res: Response) => {
  const [{ count }] = await query<{ count: string }>(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL`, [req.user!.userId]
  ) as any;
  res.json({ success: true, data: { count: Number(count) } });
});

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  await query(
    `UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user!.userId]
  );
  res.json({ success: true });
});

// PATCH /api/v1/notifications/read-all
router.patch('/read-all', authenticate, async (req: Request, res: Response) => {
  await query(
    `UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL`,
    [req.user!.userId]
  );
  res.json({ success: true });
});

export default router;
