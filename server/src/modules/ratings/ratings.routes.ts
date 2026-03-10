import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../../db/postgres/client';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { AppError, ForbiddenError, NotFoundError } from '../../middleware/errorHandler';
import { DEFAULT_SOCIAL_SCORE, MIN_RATERS_FOR_SCORE_UPDATE, SCORE_TIERS } from '../../../shared/src/constants';

// ── Schemas ───────────────────────────────────────────────

const submitRatingSchema = z.object({
  rateeId:          z.string().uuid(),
  eventId:          z.string().uuid(),
  conductScore:     z.number().int().min(1).max(5),
  socialScore:      z.number().int().min(1).max(5),
  punctualityScore: z.number().int().min(1).max(5),
  attireScore:      z.number().int().min(1).max(5),
  overallScore:     z.number().int().min(1).max(5),
  comment:          z.string().max(500).optional(),
});

// ── Score calculation ─────────────────────────────────────

function getTier(score: number): string {
  for (const [key, tier] of Object.entries(SCORE_TIERS)) {
    if (score >= tier.min && score <= tier.max) return key.toLowerCase();
  }
  return 'standard';
}

async function recalculateSocialScore(userId: string) {
  // Count how many distinct raters this user has total
  const raterCount = await queryOne<{ count: string }>(
    `SELECT COUNT(DISTINCT rater_id) AS count FROM ratings WHERE ratee_id = $1 AND is_flagged = FALSE`,
    [userId]
  );
  if (Number(raterCount?.count ?? 0) < MIN_RATERS_FOR_SCORE_UPDATE) return;

  // Weighted average: recent events count more (use RANK weighting)
  const result = await queryOne<{ score: string }>(
    `WITH ranked AS (
       SELECT event_id, AVG((conduct_score + social_score + punctuality_score + attire_score + overall_score) / 5.0) AS event_avg,
              ROW_NUMBER() OVER (ORDER BY MAX(created_at) DESC) AS recency_rank
       FROM ratings
       WHERE ratee_id = $1 AND is_flagged = FALSE
       GROUP BY event_id
     )
     SELECT SUM(event_avg * (1.0 / recency_rank)) / SUM(1.0 / recency_rank) AS score
     FROM ranked`,
    [userId]
  );

  if (!result?.score) return;

  // Map 1-5 scale to 0-1000
  const normalized = Math.round(((Number(result.score) - 1) / 4) * 1000);
  const clamped = Math.min(1000, Math.max(0, normalized));
  const tier = getTier(clamped);

  // Append to history
  const current = await queryOne<{ score_history: any[] }>(
    `SELECT score_history FROM social_scores WHERE user_id = $1`, [userId]
  );
  const history = current?.score_history ?? [];
  history.push({ score: clamped, tier, calculatedAt: new Date().toISOString() });
  // Keep last 50 entries
  if (history.length > 50) history.shift();

  await query(
    `INSERT INTO social_scores (user_id, current_score, tier, last_calculated_at, score_history)
     VALUES ($1, $2, $3, NOW(), $4)
     ON CONFLICT (user_id) DO UPDATE
       SET current_score = EXCLUDED.current_score,
           tier = EXCLUDED.tier,
           last_calculated_at = NOW(),
           score_history = EXCLUDED.score_history`,
    [userId, clamped, tier, JSON.stringify(history)]
  );
}

// ── Handlers ──────────────────────────────────────────────

// POST /api/v1/ratings — submit a rating
async function submitRating(req: Request, res: Response) {
  const dto = req.body as z.infer<typeof submitRatingSchema>;
  const raterId = req.user!.userId;

  if (raterId === dto.rateeId) throw new AppError('You cannot rate yourself', 400);

  // Verify both users attended the same event
  const [raterAttended, rateeAttended] = await Promise.all([
    queryOne(`SELECT 1 FROM guests WHERE user_id = $1 AND event_id = $2 AND checked_in = TRUE`, [raterId, dto.eventId]),
    queryOne(`SELECT 1 FROM guests WHERE user_id = $1 AND event_id = $2 AND checked_in = TRUE`, [dto.rateeId, dto.eventId]),
  ]);

  if (!raterAttended) throw new ForbiddenError('You did not attend this event');
  if (!rateeAttended) throw new ForbiddenError('The person you are rating did not attend this event');

  // Check rating window (opens 2h after start, closes 48h after end)
  const event = await queryOne<{ start_time: Date; end_time: Date }>(
    `SELECT start_time, end_time FROM events WHERE id = $1`, [dto.eventId]
  );
  if (!event) throw new NotFoundError('Event');

  const now = new Date();
  const windowOpen  = new Date(event.start_time);
  windowOpen.setHours(windowOpen.getHours() + 2);
  const windowClose = new Date(event.end_time);
  windowClose.setHours(windowClose.getHours() + 48);

  if (now < windowOpen)  throw new AppError('Rating window has not opened yet', 400);
  if (now > windowClose) throw new AppError('Rating window has closed', 400);

  const [rating] = await query(
    `INSERT INTO ratings (rater_id, ratee_id, event_id, conduct_score, social_score, punctuality_score, attire_score, overall_score, comment)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [raterId, dto.rateeId, dto.eventId, dto.conductScore, dto.socialScore, dto.punctualityScore, dto.attireScore, dto.overallScore, dto.comment]
  );

  // Async score recalculation (don't await — let it run in background)
  recalculateSocialScore(dto.rateeId).catch(console.error);

  res.status(201).json({ success: true, data: { id: rating.id, message: 'Rating submitted' } });
}

// GET /api/v1/ratings/my-score
async function getMyScore(req: Request, res: Response) {
  const score = await queryOne(
    `SELECT current_score, tier, last_calculated_at FROM social_scores WHERE user_id = $1`,
    [req.user!.userId]
  );
  const breakdown = await query(
    `SELECT
       AVG(conduct_score)::numeric(3,2)      AS conduct,
       AVG(social_score)::numeric(3,2)       AS social,
       AVG(punctuality_score)::numeric(3,2)  AS punctuality,
       AVG(attire_score)::numeric(3,2)       AS attire,
       AVG(overall_score)::numeric(3,2)      AS overall,
       COUNT(DISTINCT event_id)              AS events_rated
     FROM ratings WHERE ratee_id = $1 AND is_flagged = FALSE`,
    [req.user!.userId]
  );
  res.json({ success: true, data: { score, breakdown: breakdown[0] } });
}

// POST /api/v1/ratings/:id/flag — report abuse
async function flagRating(req: Request, res: Response) {
  await query(`UPDATE ratings SET is_flagged = TRUE WHERE id = $1`, [req.params.id]);
  res.json({ success: true, message: 'Rating flagged for review' });
}

// ── Router ────────────────────────────────────────────────

const router = Router();

router.post('/',            authenticate, validate(submitRatingSchema), submitRating);
router.get ('/my-score',    authenticate, getMyScore);
router.post('/:id/flag',    authenticate, flagRating);

export default router;
