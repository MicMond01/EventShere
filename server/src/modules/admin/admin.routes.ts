import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../../db/postgres/client';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { NotFoundError } from '../../middleware/errorHandler';

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

// ── PLATFORM STATS ────────────────────────────────────────
router.get('/stats', async (_req: Request, res: Response) => {
  const [stats] = await query(`
    SELECT
      (SELECT COUNT(*) FROM users)                                  AS total_users,
      (SELECT COUNT(*) FROM users WHERE role = 'planner')           AS planners,
      (SELECT COUNT(*) FROM users WHERE role = 'venue_owner')       AS venue_owners,
      (SELECT COUNT(*) FROM users WHERE role = 'guest')             AS guests,
      (SELECT COUNT(*) FROM venues WHERE status = 'active')         AS active_venues,
      (SELECT COUNT(*) FROM venues WHERE status = 'pending_review') AS pending_venues,
      (SELECT COUNT(*) FROM events WHERE status = 'published')      AS published_events,
      (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed')    AS confirmed_bookings,
      (SELECT COALESCE(SUM(platform_fee),0) FROM bookings WHERE payment_status = 'paid') AS total_revenue
  `);
  res.json({ success: true, data: stats });
});

// ── USER MANAGEMENT ───────────────────────────────────────
router.get('/users', async (req: Request, res: Response) => {
  const page   = Math.max(1, Number(req.query.page) || 1);
  const limit  = Math.min(100, Number(req.query.limit) || 20);
  const offset = (page - 1) * limit;
  const search = req.query.search ? `%${req.query.search}%` : null;

  const rows = search
    ? await query(
        `SELECT u.id, u.email, u.role, u.status, u.created_at, p.display_name
         FROM users u JOIN user_profiles p ON p.user_id = u.id
         WHERE LOWER(u.email) LIKE $1 OR LOWER(p.display_name) LIKE $1
         ORDER BY u.created_at DESC LIMIT $2 OFFSET $3`,
        [search.toLowerCase(), limit, offset]
      )
    : await query(
        `SELECT u.id, u.email, u.role, u.status, u.created_at, p.display_name
         FROM users u JOIN user_profiles p ON p.user_id = u.id
         ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

  res.json({ success: true, data: rows });
});

const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'banned']),
});

router.patch('/users/:id/status', validate(updateUserStatusSchema), async (req: Request, res: Response) => {
  const user = await queryOne(`SELECT id FROM users WHERE id = $1`, [req.params.id]);
  if (!user) throw new NotFoundError('User');
  await query(`UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2`, [req.body.status, req.params.id]);
  res.json({ success: true });
});

// ── VENUE MODERATION ──────────────────────────────────────
router.get('/venues/pending', async (_req: Request, res: Response) => {
  const rows = await query(
    `SELECT v.*, p.display_name AS owner_name, p.photo_url AS owner_photo
     FROM venues v JOIN user_profiles p ON p.user_id = v.owner_id
     WHERE v.status = 'pending_review' ORDER BY v.created_at ASC`
  );
  res.json({ success: true, data: rows });
});

const approveVenueSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

router.patch('/venues/:id/review', validate(approveVenueSchema), async (req: Request, res: Response) => {
  const status = req.body.action === 'approve' ? 'active' : 'suspended';
  await query(`UPDATE venues SET status = $1, updated_at = NOW() WHERE id = $2`, [status, req.params.id]);
  res.json({ success: true });
});

// ── RATING MODERATION ─────────────────────────────────────
router.get('/ratings/flagged', async (_req: Request, res: Response) => {
  const rows = await query(
    `SELECT r.*, rp.display_name AS ratee_name, e.name AS event_name
     FROM ratings r
     JOIN user_profiles rp ON rp.user_id = r.ratee_id
     JOIN events e ON e.id = r.event_id
     WHERE r.is_flagged = TRUE ORDER BY r.created_at DESC`
  );
  res.json({ success: true, data: rows });
});

router.delete('/ratings/:id', async (req: Request, res: Response) => {
  await query(`DELETE FROM ratings WHERE id = $1`, [req.params.id]);
  res.json({ success: true });
});

export default router;
