/**
 * EventShere Server — Scaffold Script
 *
 * HOW TO USE:
 * 1. Put this file inside your "server" folder
 * 2. Open Command Prompt (cmd) in that folder
 * 3. Run:  node setup.js
 * 4. Then: npm install
 *
 * Creates all 44 backend files automatically.
 */

const fs   = require('fs');
const path = require('path');

// Always create files relative to where THIS script sits
const BASE = process.cwd();

const files = [
  { p: "src/index.ts", c: `import 'express-async-errors';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { connectPostgres } from './db/postgres/client';
import { connectMongo } from './db/mongo/client';
import { connectRedis } from './config/redis';
import { initSocket } from './socket';
import { globalErrorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// ── Route imports ──
import authRoutes         from './modules/auth/auth.routes';
import userRoutes         from './modules/users/users.routes';
import venueRoutes        from './modules/venues/venues.routes';
import eventRoutes        from './modules/events/events.routes';
import guestRoutes        from './modules/guests/guests.routes';
import bookingRoutes      from './modules/bookings/bookings.routes';
import layoutRoutes       from './modules/layouts/layouts.routes';
import invitationRoutes   from './modules/invitations/invitations.routes';
import ratingRoutes       from './modules/ratings/ratings.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import paymentRoutes      from './modules/payments/payments.routes';
import searchRoutes       from './modules/search/search.routes';
import adminRoutes        from './modules/admin/admin.routes';
import uploadRoutes       from './modules/uploads/uploads.routes';
import seatingRoutes      from './modules/guests/seating.routes';

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

// ── Global middleware ──
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health check ──
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── API routes ──
const API = '/api/v1';
app.use(\`\${API}/auth\`,          authRoutes);
app.use(\`\${API}/users\`,         userRoutes);
app.use(\`\${API}/venues\`,        venueRoutes);
app.use(\`\${API}/events\`,        eventRoutes);
app.use(\`\${API}/guests\`,        guestRoutes);
app.use(\`\${API}/bookings\`,      bookingRoutes);
app.use(\`\${API}/layouts\`,       layoutRoutes);
app.use(\`\${API}/invitations\`,   invitationRoutes);
app.use(\`\${API}/ratings\`,       ratingRoutes);
app.use(\`\${API}/notifications\`, notificationRoutes);
app.use(\`\${API}/payments\`,      paymentRoutes);
app.use(\`\${API}/search\`,        searchRoutes);
app.use(\`\${API}/admin\`,         adminRoutes);
app.use(\`\${API}/uploads\`,       uploadRoutes);
app.use(\`\${API}/seating\`,       seatingRoutes);

// ── Socket.IO ──
initSocket(io);

// ── Error handling (must be last) ──
app.use(notFound);
app.use(globalErrorHandler);

// ── Start ──
const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectPostgres();
  await connectMongo();
  await connectRedis();

  httpServer.listen(PORT, () => {
    console.log(\`\\n🚀 EventShere server running on http://localhost:\${PORT}\`);
    console.log(\`📡 Socket.IO attached\`);
    console.log(\`🌍 Environment: \${process.env.NODE_ENV}\\n\`);
  });
}

bootstrap().catch(console.error);
` },
  { p: "src/modules/admin/admin.routes.ts", c: `import { Router, Request, Response } from 'express';
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
  const [stats] = await query(\`
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
  \`);
  res.json({ success: true, data: stats });
});

// ── USER MANAGEMENT ───────────────────────────────────────
router.get('/users', async (req: Request, res: Response) => {
  const page   = Math.max(1, Number(req.query.page) || 1);
  const limit  = Math.min(100, Number(req.query.limit) || 20);
  const offset = (page - 1) * limit;
  const search = req.query.search ? \`%\${req.query.search}%\` : null;

  const rows = search
    ? await query(
        \`SELECT u.id, u.email, u.role, u.status, u.created_at, p.display_name
         FROM users u JOIN user_profiles p ON p.user_id = u.id
         WHERE LOWER(u.email) LIKE $1 OR LOWER(p.display_name) LIKE $1
         ORDER BY u.created_at DESC LIMIT $2 OFFSET $3\`,
        [search.toLowerCase(), limit, offset]
      )
    : await query(
        \`SELECT u.id, u.email, u.role, u.status, u.created_at, p.display_name
         FROM users u JOIN user_profiles p ON p.user_id = u.id
         ORDER BY u.created_at DESC LIMIT $1 OFFSET $2\`,
        [limit, offset]
      );

  res.json({ success: true, data: rows });
});

const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'banned']),
});

router.patch('/users/:id/status', validate(updateUserStatusSchema), async (req: Request, res: Response) => {
  const user = await queryOne(\`SELECT id FROM users WHERE id = $1\`, [req.params.id]);
  if (!user) throw new NotFoundError('User');
  await query(\`UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2\`, [req.body.status, req.params.id]);
  res.json({ success: true });
});

// ── VENUE MODERATION ──────────────────────────────────────
router.get('/venues/pending', async (_req: Request, res: Response) => {
  const rows = await query(
    \`SELECT v.*, p.display_name AS owner_name, p.photo_url AS owner_photo
     FROM venues v JOIN user_profiles p ON p.user_id = v.owner_id
     WHERE v.status = 'pending_review' ORDER BY v.created_at ASC\`
  );
  res.json({ success: true, data: rows });
});

const approveVenueSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

router.patch('/venues/:id/review', validate(approveVenueSchema), async (req: Request, res: Response) => {
  const status = req.body.action === 'approve' ? 'active' : 'suspended';
  await query(\`UPDATE venues SET status = $1, updated_at = NOW() WHERE id = $2\`, [status, req.params.id]);
  res.json({ success: true });
});

// ── RATING MODERATION ─────────────────────────────────────
router.get('/ratings/flagged', async (_req: Request, res: Response) => {
  const rows = await query(
    \`SELECT r.*, rp.display_name AS ratee_name, e.name AS event_name
     FROM ratings r
     JOIN user_profiles rp ON rp.user_id = r.ratee_id
     JOIN events e ON e.id = r.event_id
     WHERE r.is_flagged = TRUE ORDER BY r.created_at DESC\`
  );
  res.json({ success: true, data: rows });
});

router.delete('/ratings/:id', async (req: Request, res: Response) => {
  await query(\`DELETE FROM ratings WHERE id = $1\`, [req.params.id]);
  res.json({ success: true });
});

export default router;
` },
  { p: "src/modules/ratings/ratings.routes.ts", c: `import { Router, Request, Response } from 'express';
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
    \`SELECT COUNT(DISTINCT rater_id) AS count FROM ratings WHERE ratee_id = $1 AND is_flagged = FALSE\`,
    [userId]
  );
  if (Number(raterCount?.count ?? 0) < MIN_RATERS_FOR_SCORE_UPDATE) return;

  // Weighted average: recent events count more (use RANK weighting)
  const result = await queryOne<{ score: string }>(
    \`WITH ranked AS (
       SELECT event_id, AVG((conduct_score + social_score + punctuality_score + attire_score + overall_score) / 5.0) AS event_avg,
              ROW_NUMBER() OVER (ORDER BY MAX(created_at) DESC) AS recency_rank
       FROM ratings
       WHERE ratee_id = $1 AND is_flagged = FALSE
       GROUP BY event_id
     )
     SELECT SUM(event_avg * (1.0 / recency_rank)) / SUM(1.0 / recency_rank) AS score
     FROM ranked\`,
    [userId]
  );

  if (!result?.score) return;

  // Map 1-5 scale to 0-1000
  const normalized = Math.round(((Number(result.score) - 1) / 4) * 1000);
  const clamped = Math.min(1000, Math.max(0, normalized));
  const tier = getTier(clamped);

  // Append to history
  const current = await queryOne<{ score_history: any[] }>(
    \`SELECT score_history FROM social_scores WHERE user_id = $1\`, [userId]
  );
  const history = current?.score_history ?? [];
  history.push({ score: clamped, tier, calculatedAt: new Date().toISOString() });
  // Keep last 50 entries
  if (history.length > 50) history.shift();

  await query(
    \`INSERT INTO social_scores (user_id, current_score, tier, last_calculated_at, score_history)
     VALUES ($1, $2, $3, NOW(), $4)
     ON CONFLICT (user_id) DO UPDATE
       SET current_score = EXCLUDED.current_score,
           tier = EXCLUDED.tier,
           last_calculated_at = NOW(),
           score_history = EXCLUDED.score_history\`,
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
    queryOne(\`SELECT 1 FROM guests WHERE user_id = $1 AND event_id = $2 AND checked_in = TRUE\`, [raterId, dto.eventId]),
    queryOne(\`SELECT 1 FROM guests WHERE user_id = $1 AND event_id = $2 AND checked_in = TRUE\`, [dto.rateeId, dto.eventId]),
  ]);

  if (!raterAttended) throw new ForbiddenError('You did not attend this event');
  if (!rateeAttended) throw new ForbiddenError('The person you are rating did not attend this event');

  // Check rating window (opens 2h after start, closes 48h after end)
  const event = await queryOne<{ start_time: Date; end_time: Date }>(
    \`SELECT start_time, end_time FROM events WHERE id = $1\`, [dto.eventId]
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
    \`INSERT INTO ratings (rater_id, ratee_id, event_id, conduct_score, social_score, punctuality_score, attire_score, overall_score, comment)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *\`,
    [raterId, dto.rateeId, dto.eventId, dto.conductScore, dto.socialScore, dto.punctualityScore, dto.attireScore, dto.overallScore, dto.comment]
  );

  // Async score recalculation (don't await — let it run in background)
  recalculateSocialScore(dto.rateeId).catch(console.error);

  res.status(201).json({ success: true, data: { id: rating.id, message: 'Rating submitted' } });
}

// GET /api/v1/ratings/my-score
async function getMyScore(req: Request, res: Response) {
  const score = await queryOne(
    \`SELECT current_score, tier, last_calculated_at FROM social_scores WHERE user_id = $1\`,
    [req.user!.userId]
  );
  const breakdown = await query(
    \`SELECT
       AVG(conduct_score)::numeric(3,2)      AS conduct,
       AVG(social_score)::numeric(3,2)       AS social,
       AVG(punctuality_score)::numeric(3,2)  AS punctuality,
       AVG(attire_score)::numeric(3,2)       AS attire,
       AVG(overall_score)::numeric(3,2)      AS overall,
       COUNT(DISTINCT event_id)              AS events_rated
     FROM ratings WHERE ratee_id = $1 AND is_flagged = FALSE\`,
    [req.user!.userId]
  );
  res.json({ success: true, data: { score, breakdown: breakdown[0] } });
}

// POST /api/v1/ratings/:id/flag — report abuse
async function flagRating(req: Request, res: Response) {
  await query(\`UPDATE ratings SET is_flagged = TRUE WHERE id = $1\`, [req.params.id]);
  res.json({ success: true, message: 'Rating flagged for review' });
}

// ── Router ────────────────────────────────────────────────

const router = Router();

router.post('/',            authenticate, validate(submitRatingSchema), submitRating);
router.get ('/my-score',    authenticate, getMyScore);
router.post('/:id/flag',    authenticate, flagRating);

export default router;
` },
  { p: "src/modules/search/search.routes.ts", c: `import { Router, Request, Response } from 'express';
import { query } from '../../db/postgres/client';

const router = Router();

// GET /api/v1/search?q=...&type=venues|events|all
router.get('/', async (req: Request, res: Response) => {
  const q    = (req.query.q as string || '').trim();
  const type = (req.query.type as string) || 'all';

  if (!q || q.length < 2) {
    return res.json({ success: true, data: { venues: [], events: [] } });
  }

  const pattern = \`%\${q.toLowerCase()}%\`;
  const result: any = {};

  if (type === 'venues' || type === 'all') {
    result.venues = await query(
      \`SELECT id, name, short_desc, city, state, seated_capacity, full_day_rate, currency, rating, is_verified,
              (SELECT url FROM venue_media WHERE venue_id = venues.id AND media_type = 'photo' ORDER BY sort_order LIMIT 1) AS cover_photo
       FROM venues
       WHERE status = 'active' AND (LOWER(name) LIKE $1 OR LOWER(city) LIKE $1 OR LOWER(short_desc) LIKE $1)
       ORDER BY rating DESC NULLS LAST LIMIT 10\`,
      [pattern]
    );
  }

  if (type === 'events' || type === 'all') {
    result.events = await query(
      \`SELECT e.id, e.name, e.type, e.slug, e.start_time, e.cover_image_url,
              v.name AS venue_name, v.city AS venue_city
       FROM events e
       LEFT JOIN venues v ON v.id = e.venue_id
       WHERE e.visibility = 'public' AND e.status = 'published'
         AND (LOWER(e.name) LIKE $1 OR LOWER(e.description) LIKE $1)
       ORDER BY e.start_time ASC LIMIT 10\`,
      [pattern]
    );
  }

  res.json({ success: true, data: result });
});

export default router;
` },
  { p: "src/modules/venues/venues.routes.ts", c: `import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createVenueSchema, updateVenueSchema, addMediaSchema, blockDateSchema } from './venue.schemas';
import * as svc from './venue.service';

const router = Router();

// Public
router.get ('/',                                                  async (req, res) => { res.json({ success: true, data: await svc.searchVenues(req.query as any) }); });
router.get ('/my',      authenticate, authorize('venue_owner'),   async (req, res) => { res.json({ success: true, data: await svc.getMyVenues(req.user!.userId) }); });
router.get ('/:id',                                               async (req, res) => { res.json({ success: true, data: await svc.getVenueById(req.params.id) }); });
router.get ('/:id/availability',                                  async (req, res) => { res.json({ success: true, data: await svc.getAvailability(req.params.id, req.query.month as string) }); });
router.get ('/:id/reviews',                                       async (req, res) => { res.json({ success: true, data: await svc.getReviews(req.params.id) }); });

// Venue owner actions
router.post('/',        authenticate, authorize('venue_owner'), validate(createVenueSchema),   async (req, res) => { res.status(201).json({ success: true, data: await svc.createVenue(req.user!.userId, req.body) }); });
router.patch('/:id',   authenticate, authorize('venue_owner'), validate(updateVenueSchema),   async (req, res) => { res.json({ success: true, data: await svc.updateVenue(req.params.id, req.user!.userId, req.body) }); });
router.delete('/:id',  authenticate,                                                           async (req, res) => { await svc.deleteVenue(req.params.id, req.user!.userId, req.user!.role); res.json({ success: true }); });
router.post ('/:id/media',          authenticate, authorize('venue_owner'), validate(addMediaSchema),   async (req, res) => { res.status(201).json({ success: true, data: await svc.addMedia(req.params.id, req.user!.userId, req.body) }); });
router.delete('/media/:mediaId',    authenticate, authorize('venue_owner'),                             async (req, res) => { await svc.deleteMedia(req.params.mediaId, req.user!.userId); res.json({ success: true }); });
router.post ('/:id/availability',   authenticate, authorize('venue_owner'), validate(blockDateSchema),  async (req, res) => { await svc.setAvailability(req.params.id, req.user!.userId, req.body); res.json({ success: true }); });
router.post ('/:id/reviews',        authenticate, authorize('planner'),                                 async (req, res) => { res.status(201).json({ success: true, data: await svc.addReview(req.params.id, req.user!.userId, req.body) }); });

export default router;
` },
  { p: "src/modules/venues/venue.service.ts", c: `import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError, ForbiddenError } from '../../middleware/errorHandler';
import { buildSetClause, paginate, paginatedResult } from '../../utils/helpers';
import { CreateVenueDto, UpdateVenueDto, AddMediaDto, BlockDateDto } from './venue.schemas';

// ── CRUD ──────────────────────────────────────────────────

export async function createVenue(ownerId: string, dto: CreateVenueDto) {
  const [venue] = await query(
    \`INSERT INTO venues (
       owner_id, name, short_desc, full_desc, type, address, city, state, country,
       lat, lng, seated_capacity, standing_capacity,
       length_m, width_m, height_m, amenities,
       hourly_rate, half_day_rate, full_day_rate, currency,
       security_deposit, cleaning_fee, min_notice_hours
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
     ) RETURNING *\`,
    [
      ownerId, dto.name, dto.shortDesc, dto.fullDesc, dto.type,
      dto.address, dto.city, dto.state, dto.country,
      dto.lat, dto.lng, dto.seatedCapacity, dto.standingCapacity,
      dto.lengthM, dto.widthM, dto.heightM, dto.amenities,
      dto.hourlyRate, dto.halfDayRate, dto.fullDayRate, dto.currency,
      dto.securityDeposit, dto.cleaningFee, dto.minNoticeHours,
    ]
  );
  return venue;
}

export async function getVenueById(id: string) {
  const venue = await queryOne(
    \`SELECT v.*, p.display_name AS owner_name, p.photo_url AS owner_photo
     FROM venues v
     JOIN user_profiles p ON p.user_id = v.owner_id
     WHERE v.id = $1\`,
    [id]
  );
  if (!venue) throw new NotFoundError('Venue');

  const media = await query(
    \`SELECT * FROM venue_media WHERE venue_id = $1 ORDER BY sort_order\`,
    [id]
  );
  return { ...venue, media };
}

export async function updateVenue(id: string, requesterId: string, dto: UpdateVenueDto) {
  const venue = await queryOne<{ owner_id: string }>(\`SELECT owner_id FROM venues WHERE id = $1\`, [id]);
  if (!venue) throw new NotFoundError('Venue');
  if (venue.owner_id !== requesterId) throw new ForbiddenError();

  const fieldMap: Record<string, unknown> = {};
  if (dto.name              !== undefined) fieldMap.name               = dto.name;
  if (dto.shortDesc         !== undefined) fieldMap.short_desc         = dto.shortDesc;
  if (dto.fullDesc          !== undefined) fieldMap.full_desc          = dto.fullDesc;
  if (dto.address           !== undefined) fieldMap.address            = dto.address;
  if (dto.city              !== undefined) fieldMap.city               = dto.city;
  if (dto.state             !== undefined) fieldMap.state              = dto.state;
  if (dto.seatedCapacity    !== undefined) fieldMap.seated_capacity    = dto.seatedCapacity;
  if (dto.standingCapacity  !== undefined) fieldMap.standing_capacity  = dto.standingCapacity;
  if (dto.amenities         !== undefined) fieldMap.amenities          = dto.amenities;
  if (dto.hourlyRate        !== undefined) fieldMap.hourly_rate        = dto.hourlyRate;
  if (dto.halfDayRate       !== undefined) fieldMap.half_day_rate      = dto.halfDayRate;
  if (dto.fullDayRate       !== undefined) fieldMap.full_day_rate      = dto.fullDayRate;
  if (dto.minNoticeHours    !== undefined) fieldMap.min_notice_hours   = dto.minNoticeHours;
  fieldMap.updated_at = new Date();

  const { clause, values } = buildSetClause(fieldMap);
  const [updated] = await query(
    \`UPDATE venues SET \${clause} WHERE id = $\${values.length + 1} RETURNING *\`,
    [...values, id]
  );
  return updated;
}

export async function deleteVenue(id: string, requesterId: string, role: string) {
  const venue = await queryOne<{ owner_id: string }>(\`SELECT owner_id FROM venues WHERE id = $1\`, [id]);
  if (!venue) throw new NotFoundError('Venue');
  if (venue.owner_id !== requesterId && role !== 'admin') throw new ForbiddenError();
  await query(\`DELETE FROM venues WHERE id = $1\`, [id]);
}

// ── SEARCH ────────────────────────────────────────────────

export async function searchVenues(params: {
  city?: string; type?: string; minCapacity?: string; maxCapacity?: string;
  minPrice?: string; maxPrice?: string; amenities?: string;
  page?: string; limit?: string; sort?: string;
}) {
  const { page, limit, offset } = paginate(Number(params.page), Number(params.limit));
  const conditions: string[] = [\`v.status = 'active'\`];
  const values: unknown[] = [];
  let idx = 1;

  if (params.city)        { conditions.push(\`LOWER(v.city) LIKE $\${idx++}\`);          values.push(\`%\${params.city.toLowerCase()}%\`); }
  if (params.type)        { conditions.push(\`v.type = $\${idx++}\`);                    values.push(params.type); }
  if (params.minCapacity) { conditions.push(\`v.seated_capacity >= $\${idx++}\`);        values.push(Number(params.minCapacity)); }
  if (params.maxCapacity) { conditions.push(\`v.seated_capacity <= $\${idx++}\`);        values.push(Number(params.maxCapacity)); }
  if (params.minPrice)    { conditions.push(\`v.full_day_rate >= $\${idx++}\`);          values.push(Number(params.minPrice)); }
  if (params.maxPrice)    { conditions.push(\`v.full_day_rate <= $\${idx++}\`);          values.push(Number(params.maxPrice)); }
  if (params.amenities) {
    const ams = params.amenities.split(',').map(a => a.trim());
    conditions.push(\`v.amenities @> $\${idx++}\`);
    values.push(ams);
  }

  const where = conditions.join(' AND ');
  const orderMap: Record<string, string> = {
    rating: 'v.rating DESC NULLS LAST',
    price_asc: 'v.full_day_rate ASC NULLS LAST',
    price_desc: 'v.full_day_rate DESC NULLS LAST',
    newest: 'v.created_at DESC',
  };
  const order = orderMap[params.sort || 'newest'];

  const countRow = await queryOne<{ count: string }>(
    \`SELECT COUNT(*) FROM venues v WHERE \${where}\`, values
  );
  const total = Number(countRow?.count ?? 0);

  const rows = await query(
    \`SELECT v.id, v.name, v.short_desc, v.type, v.city, v.state,
            v.seated_capacity, v.full_day_rate, v.currency,
            v.rating, v.review_count, v.is_verified,
            (SELECT url FROM venue_media WHERE venue_id = v.id AND media_type = 'photo' ORDER BY sort_order LIMIT 1) AS cover_photo
     FROM venues v
     WHERE \${where}
     ORDER BY \${order}
     LIMIT $\${idx++} OFFSET $\${idx++}\`,
    [...values, limit, offset]
  );

  return paginatedResult(rows, total, page, limit);
}

export async function getMyVenues(ownerId: string) {
  return query(
    \`SELECT v.*, 
            (SELECT COUNT(*) FROM bookings b WHERE b.venue_id = v.id) AS booking_count
     FROM venues v WHERE v.owner_id = $1 ORDER BY v.created_at DESC\`,
    [ownerId]
  );
}

// ── MEDIA ─────────────────────────────────────────────────

export async function addMedia(venueId: string, requesterId: string, dto: AddMediaDto) {
  const venue = await queryOne<{ owner_id: string }>(\`SELECT owner_id FROM venues WHERE id = $1\`, [venueId]);
  if (!venue) throw new NotFoundError('Venue');
  if (venue.owner_id !== requesterId) throw new ForbiddenError();

  const [media] = await query(
    \`INSERT INTO venue_media (venue_id, media_type, url, thumbnail_url, sort_order)
     VALUES ($1,$2,$3,$4,$5) RETURNING *\`,
    [venueId, dto.mediaType, dto.url, dto.thumbnailUrl, dto.sortOrder]
  );
  return media;
}

export async function deleteMedia(mediaId: string, requesterId: string) {
  const row = await queryOne<{ venue_id: string }>(
    \`SELECT vm.venue_id FROM venue_media vm
     JOIN venues v ON v.id = vm.venue_id
     WHERE vm.id = $1 AND v.owner_id = $2\`,
    [mediaId, requesterId]
  );
  if (!row) throw new ForbiddenError('Not your media');
  await query(\`DELETE FROM venue_media WHERE id = $1\`, [mediaId]);
}

// ── AVAILABILITY ──────────────────────────────────────────

export async function getAvailability(venueId: string, month: string) {
  // month format: "2024-07"
  return query(
    \`SELECT date, is_blocked, booking_id FROM venue_availability
     WHERE venue_id = $1 AND to_char(date, 'YYYY-MM') = $2
     ORDER BY date\`,
    [venueId, month]
  );
}

export async function setAvailability(venueId: string, requesterId: string, dto: BlockDateDto) {
  const venue = await queryOne<{ owner_id: string }>(\`SELECT owner_id FROM venues WHERE id = $1\`, [venueId]);
  if (!venue) throw new NotFoundError('Venue');
  if (venue.owner_id !== requesterId) throw new ForbiddenError();

  await query(
    \`INSERT INTO venue_availability (venue_id, date, is_blocked)
     VALUES ($1, $2, $3)
     ON CONFLICT (venue_id, date) DO UPDATE SET is_blocked = EXCLUDED.is_blocked\`,
    [venueId, dto.date, dto.isBlocked]
  );
}

export async function checkDateAvailable(venueId: string, date: string): Promise<boolean> {
  const row = await queryOne<{ is_blocked: boolean }>(
    \`SELECT is_blocked FROM venue_availability WHERE venue_id = $1 AND date = $2\`,
    [venueId, date]
  );
  return !row || !row.is_blocked;
}

// ── REVIEWS ───────────────────────────────────────────────

export async function getReviews(venueId: string) {
  return query(
    \`SELECT r.*, p.display_name AS reviewer_name, p.photo_url AS reviewer_photo
     FROM venue_reviews r
     JOIN user_profiles p ON p.user_id = r.reviewer_id
     WHERE r.venue_id = $1
     ORDER BY r.created_at DESC\`,
    [venueId]
  );
}

export async function addReview(venueId: string, reviewerId: string, dto: {
  cleanliness: number; capacityAccuracy: number; staffHelpfulness: number;
  amenityAccuracy: number; overall: number; comment?: string;
}) {
  // Verify the reviewer actually had an event at this venue
  const booked = await queryOne(
    \`SELECT b.id FROM bookings b
     JOIN events e ON e.id = b.event_id
     WHERE b.venue_id = $1 AND b.planner_id = $2 AND b.status = 'completed'
     LIMIT 1\`,
    [venueId, reviewerId]
  );
  if (!booked) throw new ForbiddenError('You can only review venues where you completed an event');

  const [review] = await query(
    \`INSERT INTO venue_reviews
       (venue_id, reviewer_id, cleanliness, capacity_accuracy, staff_helpfulness, amenity_accuracy, overall, comment)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *\`,
    [venueId, reviewerId, dto.cleanliness, dto.capacityAccuracy, dto.staffHelpfulness, dto.amenityAccuracy, dto.overall, dto.comment]
  );

  // Recalculate venue rating
  await query(
    \`UPDATE venues SET
       rating = (SELECT AVG(overall) FROM venue_reviews WHERE venue_id = $1),
       review_count = (SELECT COUNT(*) FROM venue_reviews WHERE venue_id = $1)
     WHERE id = $1\`,
    [venueId]
  );

  return review;
}
` },
  { p: "src/modules/venues/venue.schemas.ts", c: `import { z } from 'zod';

export const createVenueSchema = z.object({
  name:              z.string().min(3).max(200),
  shortDesc:         z.string().max(160).optional(),
  fullDesc:          z.string().optional(),
  type:              z.enum(['hall','conference_center','outdoor_garden','rooftop','banquet_room','amphitheatre','warehouse','church_hall','hotel_ballroom','community_center']),
  address:           z.string().min(5),
  city:              z.string().min(2),
  state:             z.string().min(2),
  country:           z.string().default('Nigeria'),
  lat:               z.number().optional(),
  lng:               z.number().optional(),
  seatedCapacity:    z.number().int().positive(),
  standingCapacity:  z.number().int().positive().optional(),
  lengthM:           z.number().positive().optional(),
  widthM:            z.number().positive().optional(),
  heightM:           z.number().positive().optional(),
  amenities:         z.array(z.string()).default([]),
  hourlyRate:        z.number().nonnegative().optional(),
  halfDayRate:       z.number().nonnegative().optional(),
  fullDayRate:       z.number().nonnegative().optional(),
  currency:          z.string().default('NGN'),
  securityDeposit:   z.number().nonnegative().optional(),
  cleaningFee:       z.number().nonnegative().optional(),
  minNoticeHours:    z.number().int().nonnegative().default(48),
});

export const updateVenueSchema = createVenueSchema.partial();

export const addMediaSchema = z.object({
  mediaType:    z.enum(['photo','video','floor_plan','model_3d','panorama']),
  url:          z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  sortOrder:    z.number().int().default(0),
});

export const blockDateSchema = z.object({
  date:      z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
  isBlocked: z.boolean(),
});

export const venueSearchSchema = z.object({
  city:        z.string().optional(),
  type:        z.string().optional(),
  minCapacity: z.string().optional(),
  maxCapacity: z.string().optional(),
  minPrice:    z.string().optional(),
  maxPrice:    z.string().optional(),
  amenities:   z.string().optional(), // comma-separated
  page:        z.string().optional(),
  limit:       z.string().optional(),
  sort:        z.enum(['rating','price_asc','price_desc','newest']).optional(),
});

export type CreateVenueDto  = z.infer<typeof createVenueSchema>;
export type UpdateVenueDto  = z.infer<typeof updateVenueSchema>;
export type AddMediaDto     = z.infer<typeof addMediaSchema>;
export type BlockDateDto    = z.infer<typeof blockDateSchema>;
` },
  { p: "src/modules/payments/payments.routes.ts", c: `import { Router, Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';
import crypto from 'crypto';
import { query, queryOne } from '../../db/postgres/client';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { NotFoundError, ForbiddenError, AppError } from '../../middleware/errorHandler';

const PAYSTACK_BASE = 'https://api.paystack.co';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

function paystackHeaders() {
  return { Authorization: \`Bearer \${PAYSTACK_SECRET}\`, 'Content-Type': 'application/json' };
}

// ── Schemas ───────────────────────────────────────────────

const initPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  email:     z.string().email(),
});

// ── Handlers ──────────────────────────────────────────────

// POST /api/v1/payments/initialize
async function initializePayment(req: Request, res: Response) {
  const { bookingId, email } = req.body as z.infer<typeof initPaymentSchema>;

  const booking = await queryOne<{ id: string; planner_id: string; total_amount: number; currency: string; payment_status: string }>(
    \`SELECT id, planner_id, total_amount, currency, payment_status FROM bookings WHERE id = $1\`, [bookingId]
  );
  if (!booking) throw new NotFoundError('Booking');
  if (booking.planner_id !== req.user!.userId) throw new ForbiddenError();
  if (booking.payment_status === 'paid') throw new AppError('Booking already paid', 409);

  // Paystack expects amount in kobo (NGN * 100)
  const amountKobo = Math.round(booking.total_amount * 100);

  const { data } = await axios.post(
    \`\${PAYSTACK_BASE}/transaction/initialize\`,
    { email, amount: amountKobo, metadata: { bookingId, userId: req.user!.userId }, currency: booking.currency || 'NGN' },
    { headers: paystackHeaders() }
  );

  // Store reference
  await query(\`UPDATE bookings SET paystack_ref = $1 WHERE id = $2\`, [data.data.reference, bookingId]);

  res.json({ success: true, data: { authorizationUrl: data.data.authorization_url, reference: data.data.reference } });
}

// POST /api/v1/payments/webhook — Paystack webhook (no auth, verified by HMAC)
async function handleWebhook(req: Request, res: Response) {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;

  if (event === 'charge.success') {
    const reference = data.reference;
    const booking = await queryOne<{ id: string }>(
      \`SELECT id FROM bookings WHERE paystack_ref = $1\`, [reference]
    );
    if (booking) {
      await query(
        \`UPDATE bookings SET payment_status = 'paid', status = 'confirmed', updated_at = NOW() WHERE id = $1\`,
        [booking.id]
      );
    }
  }

  res.sendStatus(200);
}

// GET /api/v1/payments/verify/:reference
async function verifyPayment(req: Request, res: Response) {
  const { data } = await axios.get(
    \`\${PAYSTACK_BASE}/transaction/verify/\${req.params.reference}\`,
    { headers: paystackHeaders() }
  );

  if (data.data.status === 'success') {
    const bookingId = data.data.metadata?.bookingId;
    if (bookingId) {
      await query(
        \`UPDATE bookings SET payment_status = 'paid', status = 'confirmed', updated_at = NOW() WHERE id = $1\`,
        [bookingId]
      );
    }
  }

  res.json({ success: true, data: { status: data.data.status, amount: data.data.amount / 100 } });
}

// ── Router ────────────────────────────────────────────────

const router = Router();

router.post('/initialize',       authenticate, validate(initPaymentSchema), initializePayment);
router.post('/webhook',          handleWebhook); // No authenticate — Paystack calls this
router.get ('/verify/:reference', authenticate, verifyPayment);

export default router;
` },
  { p: "src/modules/notifications/notifications.routes.ts", c: `import { Router, Request, Response } from 'express';
import { query, queryOne } from '../../db/postgres/client';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/v1/notifications — get my notifications
router.get('/', authenticate, async (req: Request, res: Response) => {
  const page  = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  const rows = await query(
    \`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3\`,
    [req.user!.userId, limit, offset]
  );

  const [{ count }] = await query<{ count: string }>(
    \`SELECT COUNT(*) FROM notifications WHERE user_id = $1\`, [req.user!.userId]
  ) as any;

  res.json({ success: true, data: rows, total: Number(count) });
});

// GET /api/v1/notifications/unread-count
router.get('/unread-count', authenticate, async (req: Request, res: Response) => {
  const [{ count }] = await query<{ count: string }>(
    \`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL\`, [req.user!.userId]
  ) as any;
  res.json({ success: true, data: { count: Number(count) } });
});

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  await query(
    \`UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2\`,
    [req.params.id, req.user!.userId]
  );
  res.json({ success: true });
});

// PATCH /api/v1/notifications/read-all
router.patch('/read-all', authenticate, async (req: Request, res: Response) => {
  await query(
    \`UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL\`,
    [req.user!.userId]
  );
  res.json({ success: true });
});

export default router;
` },
  { p: "src/modules/events/event.schemas.ts", c: `import { z } from 'zod';

export const createEventSchema = z.object({
  name:           z.string().min(3).max(200),
  type:           z.enum(['wedding','conference','birthday','product_launch','concert','funeral_reception','baby_shower','graduation','award_ceremony','religious_gathering','custom']),
  description:    z.string().optional(),
  startTime:      z.string().datetime(),
  endTime:        z.string().datetime(),
  visibility:     z.enum(['public','private','unlisted']).default('private'),
  maxGuests:      z.number().int().positive().default(100),
  rsvpDeadline:   z.string().datetime().optional(),
  coverImageUrl:  z.string().url().optional(),
  venueId:        z.string().uuid().optional(),
  seatingMode:    z.enum(['automatic','manual','hybrid']).default('manual'),
  scoreInfluence: z.enum(['off','low','medium','high']).default('off'),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['draft','published','ongoing','completed','cancelled']).optional(),
});

export const addCoPlannerSchema = z.object({
  email:      z.string().email(),
  permission: z.enum(['viewer','editor','admin']).default('editor'),
});

export const addRunsheetItemSchema = z.object({
  title:       z.string().min(2).max(200),
  description: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  assignedTo:  z.string().optional(),
  sortOrder:   z.number().int().default(0),
});

export type CreateEventDto       = z.infer<typeof createEventSchema>;
export type UpdateEventDto       = z.infer<typeof updateEventSchema>;
export type AddCoPlannerDto      = z.infer<typeof addCoPlannerSchema>;
export type AddRunsheetItemDto   = z.infer<typeof addRunsheetItemSchema>;
` },
  { p: "src/modules/events/events.routes.ts", c: `import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createEventSchema, updateEventSchema, addCoPlannerSchema, addRunsheetItemSchema } from './event.schemas';
import * as svc from './event.service';

const router = Router();

// Public
router.get('/public',        async (req, res) => { res.json({ success: true, data: await svc.getPublicEvents(req.query as any) }); });
router.get('/slug/:slug',    async (req, res) => { res.json({ success: true, data: await svc.getEventBySlug(req.params.slug) }); });

// Planner
router.get ('/my',           authenticate,                           async (req, res) => { res.json({ success: true, data: await svc.getMyEvents(req.user!.userId) }); });
router.post('/',             authenticate, validate(createEventSchema), async (req, res) => { res.status(201).json({ success: true, data: await svc.createEvent(req.user!.userId, req.body) }); });
router.get ('/:id',          authenticate,                           async (req, res) => { res.json({ success: true, data: await svc.getEventById(req.params.id, req.user!.userId) }); });
router.patch('/:id',         authenticate, validate(updateEventSchema), async (req, res) => { res.json({ success: true, data: await svc.updateEvent(req.params.id, req.user!.userId, req.body) }); });
router.delete('/:id',        authenticate,                           async (req, res) => { await svc.deleteEvent(req.params.id, req.user!.userId); res.json({ success: true }); });

// Co-planners
router.post  ('/:id/co-planners',         authenticate, validate(addCoPlannerSchema), async (req, res) => { await svc.addCoPlanner(req.params.id, req.user!.userId, req.body); res.json({ success: true }); });
router.delete('/:id/co-planners/:userId', authenticate,                               async (req, res) => { await svc.removeCoPlanner(req.params.id, req.user!.userId, req.params.userId); res.json({ success: true }); });

// Runsheet
router.post ('/:id/runsheet',      authenticate, validate(addRunsheetItemSchema), async (req, res) => { res.status(201).json({ success: true, data: await svc.addRunsheetItem(req.params.id, req.user!.userId, req.body) }); });
router.patch('/runsheet/:itemId',  authenticate,                                  async (req, res) => { res.json({ success: true, data: await svc.toggleRunsheetItem(req.params.itemId, req.user!.userId) }); });

export default router;
` },
  { p: "src/modules/events/event.service.ts", c: `import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError, ForbiddenError, ConflictError } from '../../middleware/errorHandler';
import { generateSlug, buildSetClause } from '../../utils/helpers';
import { CreateEventDto, UpdateEventDto, AddCoPlannerDto, AddRunsheetItemDto } from './event.schemas';

// ── CRUD ──────────────────────────────────────────────────

export async function createEvent(plannerId: string, dto: CreateEventDto) {
  const slug = generateSlug(dto.name);
  const [event] = await query(
    \`INSERT INTO events (
       planner_id, venue_id, name, type, description,
       start_time, end_time, visibility, max_guests,
       rsvp_deadline, cover_image_url, slug, seating_mode, score_influence
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *\`,
    [
      plannerId, dto.venueId ?? null, dto.name, dto.type, dto.description ?? null,
      dto.startTime, dto.endTime, dto.visibility, dto.maxGuests,
      dto.rsvpDeadline ?? null, dto.coverImageUrl ?? null,
      slug, dto.seatingMode, dto.scoreInfluence,
    ]
  );
  return event;
}

export async function getEventById(id: string, requesterId?: string) {
  const event = await queryOne(
    \`SELECT e.*, p.display_name AS planner_name, v.name AS venue_name, v.city AS venue_city
     FROM events e
     JOIN user_profiles p ON p.user_id = e.planner_id
     LEFT JOIN venues v ON v.id = e.venue_id
     WHERE e.id = $1\`,
    [id]
  );
  if (!event) throw new NotFoundError('Event');

  // Check access for private events
  if (event.visibility === 'private' && event.planner_id !== requesterId) {
    const isCo = await queryOne(
      \`SELECT 1 FROM event_co_planners WHERE event_id = $1 AND user_id = $2\`,
      [id, requesterId]
    );
    if (!isCo) throw new ForbiddenError('This event is private');
  }

  const runsheet = await query(
    \`SELECT * FROM event_runsheet WHERE event_id = $1 ORDER BY sort_order, scheduled_at\`,
    [id]
  );
  return { ...event, runsheet };
}

export async function getEventBySlug(slug: string) {
  const event = await queryOne(
    \`SELECT e.*, p.display_name AS planner_name, v.name AS venue_name, v.address AS venue_address
     FROM events e
     JOIN user_profiles p ON p.user_id = e.planner_id
     LEFT JOIN venues v ON v.id = e.venue_id
     WHERE e.slug = $1 AND e.visibility = 'public'\`,
    [slug]
  );
  if (!event) throw new NotFoundError('Event');
  return event;
}

export async function updateEvent(id: string, requesterId: string, dto: UpdateEventDto) {
  await assertCanEdit(id, requesterId);

  const fieldMap: Record<string, unknown> = {};
  if (dto.name          !== undefined) fieldMap.name           = dto.name;
  if (dto.description   !== undefined) fieldMap.description    = dto.description;
  if (dto.startTime     !== undefined) fieldMap.start_time     = dto.startTime;
  if (dto.endTime       !== undefined) fieldMap.end_time       = dto.endTime;
  if (dto.visibility    !== undefined) fieldMap.visibility     = dto.visibility;
  if (dto.maxGuests     !== undefined) fieldMap.max_guests     = dto.maxGuests;
  if (dto.status        !== undefined) fieldMap.status         = dto.status;
  if (dto.rsvpDeadline  !== undefined) fieldMap.rsvp_deadline  = dto.rsvpDeadline;
  if (dto.coverImageUrl !== undefined) fieldMap.cover_image_url= dto.coverImageUrl;
  if (dto.seatingMode   !== undefined) fieldMap.seating_mode   = dto.seatingMode;
  if (dto.scoreInfluence!== undefined) fieldMap.score_influence= dto.scoreInfluence;
  fieldMap.updated_at = new Date();

  const { clause, values } = buildSetClause(fieldMap);
  const [updated] = await query(
    \`UPDATE events SET \${clause} WHERE id = $\${values.length + 1} RETURNING *\`,
    [...values, id]
  );
  return updated;
}

export async function deleteEvent(id: string, requesterId: string) {
  const event = await queryOne<{ planner_id: string }>(\`SELECT planner_id FROM events WHERE id = $1\`, [id]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== requesterId) throw new ForbiddenError();
  await query(\`DELETE FROM events WHERE id = $1\`, [id]);
}

export async function getMyEvents(plannerId: string) {
  return query(
    \`SELECT e.*,
            (SELECT COUNT(*) FROM guests g WHERE g.event_id = e.id) AS guest_count,
            (SELECT COUNT(*) FROM guests g WHERE g.event_id = e.id AND g.rsvp_status = 'confirmed') AS confirmed_count
     FROM events e
     WHERE e.planner_id = $1
     ORDER BY e.start_time DESC\`,
    [plannerId]
  );
}

export async function getPublicEvents(params: { page?: string; limit?: string; type?: string; city?: string }) {
  const page  = Math.max(1, Number(params.page)  || 1);
  const limit = Math.min(50, Number(params.limit) || 20);
  const offset = (page - 1) * limit;

  const conditions = [\`e.visibility = 'public'\`, \`e.status = 'published'\`, \`e.start_time > NOW()\`];
  const values: unknown[] = [];
  let idx = 1;

  if (params.type) { conditions.push(\`e.type = $\${idx++}\`); values.push(params.type); }
  if (params.city) { conditions.push(\`LOWER(v.city) LIKE $\${idx++}\`); values.push(\`%\${params.city.toLowerCase()}%\`); }

  const where = conditions.join(' AND ');
  const rows = await query(
    \`SELECT e.id, e.name, e.type, e.slug, e.start_time, e.cover_image_url,
            v.name AS venue_name, v.city AS venue_city,
            (SELECT COUNT(*) FROM guests g WHERE g.event_id = e.id) AS rsvp_count
     FROM events e
     LEFT JOIN venues v ON v.id = e.venue_id
     WHERE \${where}
     ORDER BY e.start_time ASC
     LIMIT $\${idx++} OFFSET $\${idx++}\`,
    [...values, limit, offset]
  );
  return rows;
}

// ── CO-PLANNERS ───────────────────────────────────────────

export async function addCoPlanner(eventId: string, requesterId: string, dto: AddCoPlannerDto) {
  const event = await queryOne<{ planner_id: string }>(\`SELECT planner_id FROM events WHERE id = $1\`, [eventId]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== requesterId) throw new ForbiddenError();

  const invitee = await queryOne<{ id: string }>(\`SELECT id FROM users WHERE email = $1\`, [dto.email]);
  if (!invitee) throw new NotFoundError('User with that email');

  await query(
    \`INSERT INTO event_co_planners (event_id, user_id, permission)
     VALUES ($1, $2, $3)
     ON CONFLICT (event_id, user_id) DO UPDATE SET permission = EXCLUDED.permission\`,
    [eventId, invitee.id, dto.permission]
  );
}

export async function removeCoPlanner(eventId: string, requesterId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(\`SELECT planner_id FROM events WHERE id = $1\`, [eventId]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== requesterId) throw new ForbiddenError();
  await query(\`DELETE FROM event_co_planners WHERE event_id = $1 AND user_id = $2\`, [eventId, userId]);
}

// ── RUNSHEET ──────────────────────────────────────────────

export async function addRunsheetItem(eventId: string, requesterId: string, dto: AddRunsheetItemDto) {
  await assertCanEdit(eventId, requesterId);
  const [item] = await query(
    \`INSERT INTO event_runsheet (event_id, title, description, scheduled_at, assigned_to, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *\`,
    [eventId, dto.title, dto.description, dto.scheduledAt, dto.assignedTo, dto.sortOrder]
  );
  return item;
}

export async function toggleRunsheetItem(itemId: string, requesterId: string) {
  const item = await queryOne<{ event_id: string; is_completed: boolean }>(
    \`SELECT event_id, is_completed FROM event_runsheet WHERE id = $1\`, [itemId]
  );
  if (!item) throw new NotFoundError('Runsheet item');
  await assertCanEdit(item.event_id, requesterId);

  const [updated] = await query(
    \`UPDATE event_runsheet SET is_completed = NOT is_completed WHERE id = $1 RETURNING *\`,
    [itemId]
  );
  return updated;
}

// ── HELPERS ───────────────────────────────────────────────

async function assertCanEdit(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(
    \`SELECT planner_id FROM events WHERE id = $1\`, [eventId]
  );
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id === userId) return;

  const co = await queryOne<{ permission: string }>(
    \`SELECT permission FROM event_co_planners WHERE event_id = $1 AND user_id = $2\`,
    [eventId, userId]
  );
  if (!co || co.permission === 'viewer') throw new ForbiddenError();
}
` },
  { p: "src/modules/bookings/bookings.routes.ts", c: `import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../../db/postgres/client';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { NotFoundError, ForbiddenError, AppError } from '../../middleware/errorHandler';
import { PLATFORM_COMMISSION_RATE } from '../../../shared/src/constants';

// ── Schemas ───────────────────────────────────────────────

const createBookingSchema = z.object({
  venueId:              z.string().uuid(),
  eventId:              z.string().uuid(),
  eventDate:            z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
  totalAmount:          z.number().positive(),
  message:              z.string().optional(),
  specialRequirements:  z.string().optional(),
});

const respondBookingSchema = z.object({
  action:  z.enum(['accept','decline','counter_offer']),
  message: z.string().optional(),
  counterAmount: z.number().positive().optional(),
});

// ── Service ───────────────────────────────────────────────

async function createBooking(plannerId: string, dto: z.infer<typeof createBookingSchema>) {
  // Verify venue exists and date is available
  const venue = await queryOne<{ id: string; owner_id: string; seated_capacity: number }>(
    \`SELECT id, owner_id, seated_capacity FROM venues WHERE id = $1 AND status = 'active'\`, [dto.venueId]
  );
  if (!venue) throw new NotFoundError('Venue');

  const blocked = await queryOne(
    \`SELECT 1 FROM venue_availability WHERE venue_id = $1 AND date = $2 AND is_blocked = TRUE\`,
    [dto.venueId, dto.eventDate]
  );
  if (blocked) throw new AppError('Venue is not available on this date', 409);

  const platformFee = dto.totalAmount * PLATFORM_COMMISSION_RATE;

  const [booking] = await query(
    \`INSERT INTO bookings (venue_id, event_id, planner_id, total_amount, platform_fee, event_date, message, special_requirements)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *\`,
    [dto.venueId, dto.eventId, plannerId, dto.totalAmount, platformFee, dto.eventDate, dto.message, dto.specialRequirements]
  );
  return booking;
}

async function respondToBooking(bookingId: string, ownerId: string, dto: z.infer<typeof respondBookingSchema>) {
  const booking = await queryOne<{ id: string; venue_id: string; status: string }>(
    \`SELECT b.id, b.venue_id, b.status FROM bookings b
     JOIN venues v ON v.id = b.venue_id
     WHERE b.id = $1 AND v.owner_id = $2\`,
    [bookingId, ownerId]
  );
  if (!booking) throw new ForbiddenError('Booking not found or not your venue');
  if (booking.status !== 'pending') throw new AppError('Booking already responded to', 409);

  const statusMap: Record<string, string> = {
    accept: 'accepted', decline: 'declined', counter_offer: 'counter_offered',
  };

  const [updated] = await query(
    \`UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *\`,
    [statusMap[dto.action], bookingId]
  );

  // If accepted, block the date
  if (dto.action === 'accept') {
    await query(
      \`INSERT INTO venue_availability (venue_id, date, is_blocked, booking_id)
       VALUES ($1, $2, TRUE, $3)
       ON CONFLICT (venue_id, date) DO UPDATE SET is_blocked = TRUE, booking_id = EXCLUDED.booking_id\`,
      [booking.venue_id, updated.event_date, bookingId]
    );
    // Link booking to event
    await query(\`UPDATE events SET venue_id = (SELECT venue_id FROM bookings WHERE id = $1) WHERE id = (SELECT event_id FROM bookings WHERE id = $1)\`, [bookingId]);
  }

  return updated;
}

async function confirmBooking(bookingId: string, plannerId: string) {
  const booking = await queryOne<{ planner_id: string; status: string }>(
    \`SELECT planner_id, status FROM bookings WHERE id = $1\`, [bookingId]
  );
  if (!booking) throw new NotFoundError('Booking');
  if (booking.planner_id !== plannerId) throw new ForbiddenError();
  if (booking.status !== 'accepted') throw new AppError('Booking must be accepted before confirming', 400);

  const [updated] = await query(
    \`UPDATE bookings SET status = 'confirmed', updated_at = NOW() WHERE id = $1 RETURNING *\`,
    [bookingId]
  );
  return updated;
}

async function getMyBookings(userId: string, role: string) {
  if (role === 'planner') {
    return query(
      \`SELECT b.*, v.name AS venue_name, v.city AS venue_city, e.name AS event_name
       FROM bookings b
       JOIN venues v ON v.id = b.venue_id
       JOIN events e ON e.id = b.event_id
       WHERE b.planner_id = $1 ORDER BY b.created_at DESC\`,
      [userId]
    );
  }
  // venue_owner: bookings for their venues
  return query(
    \`SELECT b.*, v.name AS venue_name, e.name AS event_name, p.display_name AS planner_name
     FROM bookings b
     JOIN venues v ON v.id = b.venue_id
     JOIN events e ON e.id = b.event_id
     JOIN user_profiles p ON p.user_id = b.planner_id
     WHERE v.owner_id = $1 ORDER BY b.created_at DESC\`,
    [userId]
  );
}

// ── Router ────────────────────────────────────────────────

const router = Router();

router.get ('/',                  authenticate,                           async (req, res) => { res.json({ success: true, data: await getMyBookings(req.user!.userId, req.user!.role) }); });
router.post('/',                  authenticate, authorize('planner'), validate(createBookingSchema), async (req, res) => { res.status(201).json({ success: true, data: await createBooking(req.user!.userId, req.body) }); });
router.patch('/:id/respond',      authenticate, authorize('venue_owner'), validate(respondBookingSchema), async (req, res) => { res.json({ success: true, data: await respondToBooking(req.params.id, req.user!.userId, req.body) }); });
router.patch('/:id/confirm',      authenticate, authorize('planner'),     async (req, res) => { res.json({ success: true, data: await confirmBooking(req.params.id, req.user!.userId) }); });

export default router;
` },
  { p: "src/modules/layouts/layouts.routes.ts", c: `import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Layout } from '../../db/mongo/layout.model';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { NotFoundError, ForbiddenError } from '../../middleware/errorHandler';
import { queryOne } from '../../db/postgres/client';

// ── Schemas ───────────────────────────────────────────────

const sceneObjectSchema = z.object({
  id:       z.string(),
  type:     z.string(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  rotation: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  scale:    z.object({ x: z.number(), y: z.number(), z: z.number() }),
  label:    z.string().optional(),
  isLocked: z.boolean().default(false),
});

const zoneSchema = z.object({
  id:       z.string(),
  name:     z.string(),
  type:     z.enum(['seating','high_table','stage','dance_floor','vendor','walkway','registration','photography','custom']),
  color:    z.string().default('#3B82F6'),
  vertices: z.array(z.object({ x: z.number(), z: z.number() })),
});

const seatSchema = z.object({
  id:           z.string(),
  seatLabel:    z.string(),
  zoneId:       z.string(),
  category:     z.string().default('general'),
  position:     z.object({ x: z.number(), y: z.number(), z: z.number() }),
  isAccessible: z.boolean().default(false),
});

const saveLayoutSchema = z.object({
  name:    z.string().min(1).max(100),
  sceneData: z.object({
    objects:        z.array(sceneObjectSchema),
    zones:          z.array(zoneSchema),
    seats:          z.array(seatSchema),
    venueModelUrl:  z.string().url().optional(),
    gridSize:       z.number().default(0.5),
  }),
});

// ── Helpers ───────────────────────────────────────────────

async function assertPlannerOwns(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(
    \`SELECT planner_id FROM events WHERE id = $1\`, [eventId]
  );
  if (!event) throw new NotFoundError('Event');
  const isCo = await queryOne(
    \`SELECT 1 FROM event_co_planners WHERE event_id = $1 AND user_id = $2\`, [eventId, userId]
  );
  if (event.planner_id !== userId && !isCo) throw new ForbiddenError();
}

// ── Handlers ──────────────────────────────────────────────

// GET /api/v1/layouts/:eventId — get all versions
async function getLayouts(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);
  const layouts = await Layout.find({ eventId: req.params.eventId })
    .select('-sceneData') // don't send full scene on list
    .sort({ createdAt: -1 });
  res.json({ success: true, data: layouts });
}

// GET /api/v1/layouts/:eventId/active — get the active layout (full)
async function getActiveLayout(req: Request, res: Response) {
  const layout = await Layout.findOne({ eventId: req.params.eventId, isActive: true });
  if (!layout) throw new NotFoundError('Layout');
  res.json({ success: true, data: layout });
}

// GET /api/v1/layouts/:eventId/:layoutId — get specific version
async function getLayoutById(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);
  const layout = await Layout.findById(req.params.layoutId);
  if (!layout || layout.eventId !== req.params.eventId) throw new NotFoundError('Layout');
  res.json({ success: true, data: layout });
}

// POST /api/v1/layouts/:eventId — save new version
async function saveLayout(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);

  // Version number = count of existing + 1
  const count = await Layout.countDocuments({ eventId: req.params.eventId });

  // Deactivate previous active layout
  await Layout.updateMany({ eventId: req.params.eventId }, { isActive: false });

  const layout = await Layout.create({
    eventId:       req.params.eventId,
    name:          req.body.name,
    versionNumber: count + 1,
    isActive:      true,
    sceneData:     req.body.sceneData,
  });

  res.status(201).json({ success: true, data: layout });
}

// PATCH /api/v1/layouts/:eventId/:layoutId/activate
async function activateLayout(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);
  await Layout.updateMany({ eventId: req.params.eventId }, { isActive: false });
  const layout = await Layout.findByIdAndUpdate(
    req.params.layoutId, { isActive: true }, { new: true }
  );
  if (!layout) throw new NotFoundError('Layout');
  res.json({ success: true, data: layout });
}

// DELETE /api/v1/layouts/:eventId/:layoutId
async function deleteLayout(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);
  const layout = await Layout.findById(req.params.layoutId);
  if (!layout) throw new NotFoundError('Layout');
  if (layout.isActive) throw new NotFoundError('Cannot delete the active layout');
  await layout.deleteOne();
  res.json({ success: true });
}

// GET /api/v1/layouts/:eventId/seats — extract flat seat list for algorithm
async function getSeats(req: Request, res: Response) {
  const layout = await Layout.findOne({ eventId: req.params.eventId, isActive: true });
  if (!layout) throw new NotFoundError('Active layout');
  res.json({ success: true, data: layout.sceneData.seats });
}

// ── Router ────────────────────────────────────────────────

const router = Router();

router.get   ('/:eventId',               authenticate, getLayouts);
router.get   ('/:eventId/active',        authenticate, getActiveLayout);
router.get   ('/:eventId/seats',         authenticate, getSeats);
router.get   ('/:eventId/:layoutId',     authenticate, getLayoutById);
router.post  ('/:eventId',               authenticate, validate(saveLayoutSchema), saveLayout);
router.patch ('/:eventId/:layoutId/activate', authenticate, activateLayout);
router.delete('/:eventId/:layoutId',     authenticate, deleteLayout);

export default router;
` },
  { p: "src/modules/guests/guests.routes.ts", c: `import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { addGuestSchema, updateGuestSchema, bulkAddGuestsSchema } from './guest.schemas';
import * as svc from './guest.service';

const router = Router();

// Public: guest views their own invite by token
router.get('/invite/:token', async (req, res) => {
  res.json({ success: true, data: await svc.getGuestByInvitationToken(req.params.token) });
});

// Planner: manage guests for an event
router.get   ('/:eventId/guests',                     authenticate, async (req, res) => { res.json({ success: true, data: await svc.getGuests(req.params.eventId, req.user!.userId, req.query as any) }); });
router.post  ('/:eventId/guests',                     authenticate, validate(addGuestSchema),       async (req, res) => { res.status(201).json({ success: true, data: await svc.addGuest(req.params.eventId, req.user!.userId, req.body) }); });
router.post  ('/:eventId/guests/bulk',                authenticate, validate(bulkAddGuestsSchema),  async (req, res) => { res.status(201).json({ success: true, data: await svc.bulkAddGuests(req.params.eventId, req.user!.userId, req.body.guests) }); });
router.patch ('/:eventId/guests/:guestId',            authenticate, validate(updateGuestSchema),    async (req, res) => { res.json({ success: true, data: await svc.updateGuest(req.params.guestId, req.user!.userId, req.body) }); });
router.delete('/:eventId/guests/:guestId',            authenticate,                                 async (req, res) => { await svc.removeGuest(req.params.guestId, req.user!.userId); res.json({ success: true }); });

// Check-in
router.post  ('/:eventId/checkin',                    authenticate, async (req, res) => { res.json({ success: true, data: await svc.checkInGuest(req.params.eventId, req.user!.userId, req.body) }); });
router.get   ('/:eventId/checkin/stats',              authenticate, async (req, res) => { res.json({ success: true, data: await svc.getCheckinStats(req.params.eventId, req.user!.userId) }); });

export default router;
` },
  { p: "src/modules/guests/guest.schemas.ts", c: `import { z } from 'zod';

export const addGuestSchema = z.object({
  name:            z.string().min(2).max(200),
  email:           z.string().email().optional(),
  phone:           z.string().max(20).optional(),
  category:        z.enum(['vip','dignitary','family','general','press','vendor_staff']).default('general'),
  notes:           z.string().optional(),
  dietaryReq:      z.string().optional(),
  accessibilityReq:z.string().optional(),
});

export const bulkAddGuestsSchema = z.object({
  guests: z.array(addGuestSchema).min(1).max(1000),
});

export const updateGuestSchema = addGuestSchema.partial().extend({
  rsvpStatus: z.enum(['pending','confirmed','declined','tentative','waitlisted']).optional(),
  seatId:     z.string().optional(),
});

export const checkInSchema = z.object({
  qrCode:    z.string().optional(),
  guestId:   z.string().uuid().optional(),
  seatLabel: z.string().optional(),
});

export type AddGuestDto    = z.infer<typeof addGuestSchema>;
export type UpdateGuestDto = z.infer<typeof updateGuestSchema>;
export type CheckInDto     = z.infer<typeof checkInSchema>;
` },
  { p: "src/modules/guests/guest.service.ts", c: `import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError, ForbiddenError, AppError } from '../../middleware/errorHandler';
import { buildSetClause, generateToken, generateQRCode } from '../../utils/helpers';
import { AddGuestDto, UpdateGuestDto } from './guest.schemas';
import { Server as SocketServer } from 'socket.io';

// ── CRUD ──────────────────────────────────────────────────

export async function addGuest(eventId: string, requesterId: string, dto: AddGuestDto) {
  await assertPlannerOwns(eventId, requesterId);

  // Check capacity
  const event = await queryOne<{ max_guests: number }>(
    \`SELECT max_guests FROM events WHERE id = $1\`, [eventId]
  );
  const { count } = await queryOne<{ count: string }>(
    \`SELECT COUNT(*)::int AS count FROM guests WHERE event_id = $1 AND rsvp_status != 'declined'\`, [eventId]
  ) as any;

  const qrData = \`eventshere:checkin:\${generateToken(16)}\`;
  const qrCode = await generateQRCode(qrData);

  const rsvpStatus = count >= (event?.max_guests ?? 0) ? 'waitlisted' : 'pending';

  const [guest] = await query(
    \`INSERT INTO guests (event_id, name, email, phone, category, rsvp_status, notes, dietary_req, accessibility_req, qr_code)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *\`,
    [eventId, dto.name, dto.email, dto.phone, dto.category, rsvpStatus, dto.notes, dto.dietaryReq, dto.accessibilityReq, qrCode]
  );
  return guest;
}

export async function bulkAddGuests(eventId: string, requesterId: string, guests: AddGuestDto[]) {
  await assertPlannerOwns(eventId, requesterId);
  const results = await Promise.allSettled(
    guests.map(g => addGuest(eventId, requesterId, g))
  );
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed    = results.filter(r => r.status === 'rejected').length;
  return { succeeded, failed, total: guests.length };
}

export async function getGuests(eventId: string, requesterId: string, filters: {
  category?: string; rsvpStatus?: string; page?: string; limit?: string;
}) {
  await assertPlannerOwns(eventId, requesterId);

  const conditions = [\`event_id = $1\`];
  const values: unknown[] = [eventId];
  let idx = 2;

  if (filters.category)   { conditions.push(\`category = $\${idx++}\`);    values.push(filters.category); }
  if (filters.rsvpStatus) { conditions.push(\`rsvp_status = $\${idx++}\`); values.push(filters.rsvpStatus); }

  const page   = Math.max(1, Number(filters.page)  || 1);
  const limit  = Math.min(200, Number(filters.limit) || 50);
  const offset = (page - 1) * limit;

  const where = conditions.join(' AND ');
  const [{ count }] = await query<{ count: string }>(\`SELECT COUNT(*) FROM guests WHERE \${where}\`, values) as any;

  const rows = await query(
    \`SELECT g.*, sa.seat_label, sa.zone_name
     FROM guests g
     LEFT JOIN seat_assignments sa ON sa.guest_id = g.id AND sa.event_id = $1
     WHERE \${where}
     ORDER BY g.category, g.name
     LIMIT $\${idx++} OFFSET $\${idx++}\`,
    [...values, limit, offset]
  );

  return { data: rows, total: Number(count), page, limit };
}

export async function getGuestById(guestId: string) {
  const guest = await queryOne(
    \`SELECT g.*, sa.seat_label, sa.zone_name
     FROM guests g
     LEFT JOIN seat_assignments sa ON sa.guest_id = g.id
     WHERE g.id = $1\`,
    [guestId]
  );
  if (!guest) throw new NotFoundError('Guest');
  return guest;
}

export async function updateGuest(guestId: string, requesterId: string, dto: UpdateGuestDto) {
  const guest = await queryOne<{ event_id: string }>(\`SELECT event_id FROM guests WHERE id = $1\`, [guestId]);
  if (!guest) throw new NotFoundError('Guest');
  await assertPlannerOwns(guest.event_id, requesterId);

  const fieldMap: Record<string, unknown> = {};
  if (dto.name             !== undefined) fieldMap.name              = dto.name;
  if (dto.email            !== undefined) fieldMap.email             = dto.email;
  if (dto.phone            !== undefined) fieldMap.phone             = dto.phone;
  if (dto.category         !== undefined) fieldMap.category          = dto.category;
  if (dto.rsvpStatus       !== undefined) fieldMap.rsvp_status       = dto.rsvpStatus;
  if (dto.notes            !== undefined) fieldMap.notes             = dto.notes;
  if (dto.dietaryReq       !== undefined) fieldMap.dietary_req       = dto.dietaryReq;
  if (dto.accessibilityReq !== undefined) fieldMap.accessibility_req = dto.accessibilityReq;

  const { clause, values } = buildSetClause(fieldMap);
  const [updated] = await query(
    \`UPDATE guests SET \${clause} WHERE id = $\${values.length + 1} RETURNING *\`,
    [...values, guestId]
  );
  return updated;
}

export async function removeGuest(guestId: string, requesterId: string) {
  const guest = await queryOne<{ event_id: string }>(\`SELECT event_id FROM guests WHERE id = $1\`, [guestId]);
  if (!guest) throw new NotFoundError('Guest');
  await assertPlannerOwns(guest.event_id, requesterId);
  await query(\`DELETE FROM guests WHERE id = $1\`, [guestId]);
}

// ── CHECK-IN ──────────────────────────────────────────────

export async function checkInGuest(eventId: string, requesterId: string, dto: { qrCode?: string; guestId?: string }, io?: SocketServer) {
  await assertPlannerOwns(eventId, requesterId);

  let guest: any;
  if (dto.qrCode) {
    guest = await queryOne(\`SELECT * FROM guests WHERE qr_code = $1 AND event_id = $2\`, [dto.qrCode, eventId]);
  } else if (dto.guestId) {
    guest = await queryOne(\`SELECT * FROM guests WHERE id = $1 AND event_id = $2\`, [dto.guestId, eventId]);
  }

  if (!guest) throw new NotFoundError('Guest');
  if (guest.checked_in) throw new AppError('Guest already checked in', 409);

  const [updated] = await query(
    \`UPDATE guests SET checked_in = TRUE, checked_in_at = NOW() WHERE id = $1 RETURNING *\`,
    [guest.id]
  );

  // Real-time update to all planner dashboards watching this event
  if (io) {
    io.to(\`event:\${eventId}\`).emit('checkin:update', {
      guestId: guest.id,
      guestName: guest.name,
      seatLabel: guest.seat_label,
      checkedInAt: updated.checked_in_at,
    });
  }

  return updated;
}

export async function getCheckinStats(eventId: string, requesterId: string) {
  await assertPlannerOwns(eventId, requesterId);
  const [stats] = await query(
    \`SELECT
       COUNT(*) FILTER (WHERE rsvp_status = 'confirmed') AS confirmed,
       COUNT(*) FILTER (WHERE checked_in = TRUE) AS checked_in,
       COUNT(*) FILTER (WHERE rsvp_status = 'confirmed' AND checked_in = FALSE) AS not_arrived,
       COUNT(*) AS total
     FROM guests WHERE event_id = $1\`,
    [eventId]
  );
  return stats;
}

// ── SEAT ASSIGNMENT ───────────────────────────────────────

export async function assignSeat(
  guestId: string, eventId: string, seatLabel: string, zoneName: string,
  requesterId: string, assignedBy: 'manual' | 'algorithm' = 'manual'
) {
  const guest = await queryOne<{ event_id: string }>(\`SELECT event_id FROM guests WHERE id = $1\`, [guestId]);
  if (!guest) throw new NotFoundError('Guest');
  if (assignedBy === 'manual') await assertPlannerOwns(guest.event_id, requesterId);

  await query(
    \`INSERT INTO seat_assignments (guest_id, event_id, seat_label, zone_name, assigned_by)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (guest_id, event_id) DO UPDATE
       SET seat_label = EXCLUDED.seat_label,
           zone_name  = EXCLUDED.zone_name,
           assigned_by= EXCLUDED.assigned_by,
           assigned_at= NOW()\`,
    [guestId, eventId, seatLabel, zoneName, assignedBy]
  );
}

export async function getGuestByInvitationToken(token: string) {
  const inv = await queryOne(
    \`SELECT i.*, g.name, g.email, g.category, g.rsvp_status,
            e.name AS event_name, e.start_time, e.end_time,
            v.name AS venue_name, v.address AS venue_address,
            sa.seat_label, sa.zone_name
     FROM invitations i
     JOIN guests g ON g.id = i.guest_id
     JOIN events e ON e.id = i.event_id
     LEFT JOIN venues v ON v.id = e.venue_id
     LEFT JOIN seat_assignments sa ON sa.guest_id = g.id AND sa.event_id = e.id
     WHERE i.token = $1\`,
    [token]
  );
  if (!inv) throw new NotFoundError('Invitation');
  return inv;
}

// ── HELPERS ───────────────────────────────────────────────

async function assertPlannerOwns(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(
    \`SELECT planner_id FROM events WHERE id = $1\`, [eventId]
  );
  if (!event) throw new NotFoundError('Event');

  if (event.planner_id === userId) return;

  const co = await queryOne(
    \`SELECT 1 FROM event_co_planners WHERE event_id = $1 AND user_id = $2 AND permission IN ('editor','admin')\`,
    [eventId, userId]
  );
  if (!co) throw new ForbiddenError('You do not have access to this event');
}
` },
  { p: "src/modules/guests/seating.routes.ts", c: `import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { queryOne } from '../../db/postgres/client';
import { ForbiddenError, NotFoundError } from '../../middleware/errorHandler';
import { runSeatAlgorithm } from './seating.algorithm';

const router = Router();

// POST /api/v1/seating/:eventId/run
router.post('/:eventId/run', authenticate, async (req: Request, res: Response) => {
  const event = await queryOne<{ planner_id: string; score_influence: string }>(
    \`SELECT planner_id, score_influence FROM events WHERE id = $1\`, [req.params.eventId]
  );
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== req.user!.userId) throw new ForbiddenError();

  const result = await runSeatAlgorithm(req.params.eventId, {
    useScoreInfluence: event.score_influence !== 'off',
  });

  res.json({ success: true, data: result });
});

export default router;
` },
  { p: "src/modules/guests/seating.algorithm.ts", c: `/**
 * EventShere Seating Algorithm
 * Constraint-based guest-to-seat assignment engine.
 *
 * Priority tiers:
 *   1. Honoree / Host
 *   2. Dignitaries / Government
 *   3. Immediate Family
 *   4. VIP Friends / Senior Colleagues
 *   5. General Guests (sorted by social score when enabled)
 *   6. Press / Media
 */

import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError } from '../../middleware/errorHandler';
import { Layout } from '../../db/mongo/layout.model';

interface Guest {
  id: string;
  name: string;
  category: 'vip' | 'dignitary' | 'family' | 'general' | 'press' | 'vendor_staff';
  rsvpStatus: string;
  accessibilityReq?: string;
  socialScore?: number;
}

interface Seat {
  id: string;
  seatLabel: string;
  zoneId: string;
  category: string;
  isAccessible: boolean;
}

interface Zone {
  id: string;
  name: string;
  type: string;
}

interface Assignment {
  guestId: string;
  guestName: string;
  seatId: string;
  seatLabel: string;
  zoneName: string;
  assignedBy: 'algorithm';
}

const CATEGORY_PRIORITY: Record<string, number> = {
  vip:          1,
  dignitary:    1,
  family:       2,
  general:      3,
  press:        4,
  vendor_staff: 5,
};

const ZONE_CATEGORY_MAP: Record<string, string[]> = {
  high_table: ['vip', 'dignitary'],
  seating:    ['family', 'general', 'press'],
  stage:      [],
  vendor:     ['vendor_staff'],
};

export async function runSeatAlgorithm(
  eventId: string,
  options: { useScoreInfluence: boolean }
): Promise<{ assignments: Assignment[]; unassigned: string[]; conflicts: string[] }> {
  // 1. Load guests (confirmed only)
  const rawGuests = await query<any>(
    \`SELECT g.id, g.name, g.category, g.rsvp_status, g.accessibility_req,
            ss.current_score AS social_score
     FROM guests g
     LEFT JOIN social_scores ss ON ss.user_id = g.user_id
     WHERE g.event_id = $1 AND g.rsvp_status = 'confirmed'\`,
    [eventId]
  );

  if (!rawGuests.length) return { assignments: [], unassigned: [], conflicts: [] };

  // 2. Load active layout seats + zones
  const layout = await Layout.findOne({ eventId, isActive: true });
  if (!layout) throw new NotFoundError('Active layout — run the 3D planner first');

  const seats: Seat[] = layout.sceneData.seats;
  const zones: Zone[] = layout.sceneData.zones;

  // 3. Sort guests by priority, then social score (if enabled)
  const guests: Guest[] = rawGuests.map(g => ({
    id: g.id, name: g.name, category: g.category,
    rsvpStatus: g.rsvp_status, accessibilityReq: g.accessibility_req,
    socialScore: g.social_score ?? 500,
  }));

  guests.sort((a, b) => {
    const prioDiff = (CATEGORY_PRIORITY[a.category] ?? 5) - (CATEGORY_PRIORITY[b.category] ?? 5);
    if (prioDiff !== 0) return prioDiff;
    if (options.useScoreInfluence) return (b.socialScore ?? 500) - (a.socialScore ?? 500);
    return 0;
  });

  // 4. Separate accessible seats
  const accessibleSeats = seats.filter(s => s.isAccessible);
  const regularSeats    = seats.filter(s => !s.isAccessible);

  // Zone lookup
  const zoneMap = new Map(zones.map(z => [z.id, z]));

  const assignments: Assignment[] = [];
  const unassigned: string[]      = [];
  const conflicts: string[]       = [];
  const usedSeatIds               = new Set<string>();

  function findSeat(guest: Guest): Seat | undefined {
    // Must use accessible seat if needed
    const pool = guest.accessibilityReq ? [...accessibleSeats, ...regularSeats] : regularSeats;

    // Try to match zone type to guest category
    const allowedZoneTypes = Object.entries(ZONE_CATEGORY_MAP)
      .filter(([, cats]) => cats.includes(guest.category) || cats.length === 0)
      .map(([type]) => type);

    // First pass: preferred zone
    for (const seat of pool) {
      if (usedSeatIds.has(seat.id)) continue;
      const zone = zoneMap.get(seat.zoneId);
      if (zone && allowedZoneTypes.includes(zone.type)) return seat;
    }

    // Second pass: any available seat (graceful fallback)
    for (const seat of pool) {
      if (!usedSeatIds.has(seat.id)) return seat;
    }

    return undefined;
  }

  // 5. Assign
  for (const guest of guests) {
    const seat = findSeat(guest);
    if (!seat) {
      unassigned.push(guest.id);
      conflicts.push(\`No seat available for \${guest.name} (\${guest.category})\`);
      continue;
    }

    usedSeatIds.add(seat.id);
    const zone = zoneMap.get(seat.zoneId);
    assignments.push({
      guestId:    guest.id,
      guestName:  guest.name,
      seatId:     seat.id,
      seatLabel:  seat.seatLabel,
      zoneName:   zone?.name ?? 'General',
      assignedBy: 'algorithm',
    });
  }

  // 6. Persist assignments
  for (const a of assignments) {
    await query(
      \`INSERT INTO seat_assignments (guest_id, event_id, seat_label, zone_name, assigned_by)
       VALUES ($1,$2,$3,$4,'algorithm')
       ON CONFLICT (guest_id, event_id) DO UPDATE
         SET seat_label = EXCLUDED.seat_label,
             zone_name  = EXCLUDED.zone_name,
             assigned_by= 'algorithm',
             assigned_at= NOW()\`,
      [a.guestId, eventId, a.seatLabel, a.zoneName]
    );
  }

  return { assignments, unassigned, conflicts };
}
` },
  { p: "src/modules/users/user.service.ts", c: `import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError } from '../../middleware/errorHandler';
import { UpdateProfileDto } from './user.schemas';
import { buildSetClause } from '../../utils/helpers';

export async function getProfile(userId: string) {
  const user = await queryOne(
    \`SELECT u.id, u.email, u.role, u.status, u.created_at,
            p.display_name, p.photo_url, p.bio, p.phone,
            ss.current_score, ss.tier
     FROM users u
     JOIN user_profiles p ON p.user_id = u.id
     LEFT JOIN social_scores ss ON ss.user_id = u.id
     WHERE u.id = $1\`,
    [userId]
  );
  if (!user) throw new NotFoundError('User');
  return user;
}

export async function updateProfile(userId: string, dto: UpdateProfileDto) {
  const fields: Record<string, unknown> = {};
  if (dto.displayName !== undefined) fields.display_name = dto.displayName;
  if (dto.bio         !== undefined) fields.bio          = dto.bio;
  if (dto.phone       !== undefined) fields.phone        = dto.phone;
  if (dto.photoUrl    !== undefined) fields.photo_url    = dto.photoUrl;

  if (Object.keys(fields).length === 0) return getProfile(userId);

  const { clause, values } = buildSetClause({ ...fields, updated_at: new Date() });
  await query(
    \`UPDATE user_profiles SET \${clause} WHERE user_id = $\${values.length + 1}\`,
    [...values, userId]
  );
  return getProfile(userId);
}

export async function getUserPublicProfile(userId: string) {
  const user = await queryOne(
    \`SELECT u.id, u.role, p.display_name, p.photo_url, p.bio,
            ss.current_score, ss.tier
     FROM users u
     JOIN user_profiles p ON p.user_id = u.id
     LEFT JOIN social_scores ss ON ss.user_id = u.id
     WHERE u.id = $1 AND u.status = 'active'\`,
    [userId]
  );
  if (!user) throw new NotFoundError('User');
  return user;
}

export async function getScoreHistory(userId: string) {
  const row = await queryOne<{ score_history: any[] }>(
    \`SELECT score_history FROM social_scores WHERE user_id = $1\`,
    [userId]
  );
  return row?.score_history ?? [];
}
` },
  { p: "src/modules/users/user.schemas.ts", c: `import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  bio:         z.string().max(500).optional(),
  phone:       z.string().max(20).optional(),
  photoUrl:    z.string().url().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
` },
  { p: "src/modules/users/users.routes.ts", c: `import { Router, Request, Response } from 'express';
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
` },
  { p: "src/modules/uploads/uploads.routes.ts", c: `import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/auth.middleware';
import cloudinary from '../../config/cloudinary';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new AppError('File type not allowed', 400));
  },
});

async function toCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: \`eventshere/\${folder}\`, resource_type: resourceType },
      (err, result) => {
        if (err || !result) return reject(err || new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

router.post('/image', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const result = await toCloudinary(req.file.buffer, (req.query.folder as string) || 'general');
  res.json({ success: true, data: result });
});

router.post('/images', authenticate, upload.array('files', 10), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) throw new AppError('No files uploaded', 400);
  const folder = (req.query.folder as string) || 'general';
  const results = await Promise.all(files.map(f => toCloudinary(f.buffer, folder)));
  res.json({ success: true, data: results });
});

router.post('/video', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const result = await toCloudinary(req.file.buffer, 'videos', 'video');
  res.json({ success: true, data: result });
});

router.post('/model', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const result = await toCloudinary(req.file.buffer, 'models', 'raw');
  res.json({ success: true, data: result });
});

export default router;
` },
  { p: "src/modules/auth/auth.controller.ts", c: `import { Request, Response } from 'express';
import * as authService from './auth.service';

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.status(201).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, error: { message: 'No refresh token', code: 'UNAUTHORIZED' } });
  }
  const result = await authService.refreshTokens(token);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ success: true, data: { accessToken: result.accessToken } });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (token) await authService.logout(token);
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
}

export async function me(req: Request, res: Response) {
  res.json({ success: true, data: { user: req.user } });
}
` },
  { p: "src/modules/auth/auth.schemas.ts", c: `import { z } from 'zod';

export const registerSchema = z.object({
  email:       z.string().email(),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).max(100),
  role:        z.enum(['venue_owner', 'planner', 'guest', 'vendor']),
  phone:       z.string().optional(),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8),
});

export type RegisterDto        = z.infer<typeof registerSchema>;
export type LoginDto           = z.infer<typeof loginSchema>;
export type ForgotPasswordDto  = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto   = z.infer<typeof resetPasswordSchema>;
` },
  { p: "src/modules/auth/auth.routes.ts", c: `import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { registerSchema, loginSchema } from './auth.schemas';
import * as controller from './auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login',    validate(loginSchema),    controller.login);
router.post('/refresh',                            controller.refresh);
router.post('/logout',                             controller.logout);
router.get ('/me',       authenticate,             controller.me);

export default router;
` },
  { p: "src/modules/auth/auth.service.ts", c: `import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../../db/postgres/client';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../middleware/errorHandler';
import { RegisterDto, LoginDto } from './auth.schemas';
import { JwtPayload } from '../../middleware/auth.middleware';

// ── Token helpers ──────────────────────────────────────────

function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
}

function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

// ── Service methods ────────────────────────────────────────

export async function register(dto: RegisterDto) {
  // Check duplicate email
  const existing = await queryOne('SELECT id FROM users WHERE email = $1', [dto.email]);
  if (existing) throw new ConflictError('An account with this email already exists');

  const passwordHash = await bcrypt.hash(dto.password, 12);

  // Insert user
  const [user] = await query<{ id: string; email: string; role: string }>(
    \`INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role\`,
    [dto.email, passwordHash, dto.role]
  );

  // Insert profile
  await query(
    \`INSERT INTO user_profiles (user_id, display_name, phone) VALUES ($1, $2, $3)\`,
    [user.id, dto.displayName, dto.phone ?? null]
  );

  // Create social score record
  await query(
    \`INSERT INTO social_scores (user_id) VALUES ($1) ON CONFLICT DO NOTHING\`,
    [user.id]
  );

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role as any };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Persist refresh token
  await storeRefreshToken(user.id, refreshToken);

  return { user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken };
}

export async function login(dto: LoginDto) {
  const user = await queryOne<{ id: string; email: string; password: string; role: string; status: string }>(
    \`SELECT id, email, password, role, status FROM users WHERE email = $1\`,
    [dto.email]
  );

  if (!user) throw new UnauthorizedError('Invalid email or password');
  if (user.status === 'suspended') throw new UnauthorizedError('Account suspended');
  if (user.status === 'banned') throw new UnauthorizedError('Account banned');

  const isMatch = await bcrypt.compare(dto.password, user.password);
  if (!isMatch) throw new UnauthorizedError('Invalid email or password');

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role as any };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await storeRefreshToken(user.id, refreshToken);

  return { user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken };
}

export async function refreshTokens(oldRefreshToken: string) {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Check it exists and isn't revoked
  const stored = await queryOne<{ id: string; is_revoked: boolean }>(
    \`SELECT id, is_revoked FROM refresh_tokens WHERE token = $1\`,
    [oldRefreshToken]
  );
  if (!stored || stored.is_revoked) throw new UnauthorizedError('Refresh token revoked');

  // Rotate: revoke old, issue new
  await query(\`UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1\`, [oldRefreshToken]);

  const newAccessToken  = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);
  await storeRefreshToken(payload.userId, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string) {
  await query(\`UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1\`, [refreshToken]);
}

export async function revokeAllSessions(userId: string) {
  await query(\`UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1\`, [userId]);
}

// ── Private helpers ────────────────────────────────────────

async function storeRefreshToken(userId: string, token: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await query(
    \`INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)\`,
    [userId, token, expiresAt]
  );
}
` },
  { p: "src/modules/invitations/invitations.routes.ts", c: `import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../../db/postgres/client';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { NotFoundError, ForbiddenError } from '../../middleware/errorHandler';
import { generateToken, generateQRCode } from '../../utils/helpers';
import { sendEmail, invitationEmail, seatAssignmentEmail } from '../../utils/email';

// ── Schemas ───────────────────────────────────────────────

const sendInvitationsSchema = z.object({
  guestIds: z.array(z.string().uuid()).min(1),
  channel:  z.enum(['email','sms','whatsapp','in_app']).default('email'),
});

const rsvpSchema = z.object({
  token:  z.string(),
  status: z.enum(['confirmed','declined','tentative']),
  dietaryReq:       z.string().optional(),
  accessibilityReq: z.string().optional(),
});

const sendSeatNotificationsSchema = z.object({
  guestIds: z.array(z.string().uuid()).optional(), // empty = all assigned guests
});

// ── Helpers ───────────────────────────────────────────────

async function assertPlannerOwns(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(
    \`SELECT planner_id FROM events WHERE id = $1\`, [eventId]
  );
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== userId) throw new ForbiddenError();
}

// ── Handlers ──────────────────────────────────────────────

// POST /api/v1/invitations/:eventId/send
async function sendInvitations(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);
  const { guestIds, channel } = req.body as z.infer<typeof sendInvitationsSchema>;

  const event = await queryOne<{ name: string; start_time: Date; rsvp_deadline: Date }>(
    \`SELECT name, start_time, rsvp_deadline FROM events WHERE id = $1\`, [req.params.eventId]
  );
  if (!event) throw new NotFoundError('Event');

  const venue = await queryOne<{ name: string }>(
    \`SELECT v.name FROM venues v JOIN events e ON e.venue_id = v.id WHERE e.id = $1\`,
    [req.params.eventId]
  );

  const results = { sent: 0, failed: 0 };

  for (const guestId of guestIds) {
    try {
      const guest = await queryOne<{ id: string; name: string; email: string }>(
        \`SELECT id, name, email FROM guests WHERE id = $1 AND event_id = $2\`,
        [guestId, req.params.eventId]
      );
      if (!guest || !guest.email) continue;

      const token = generateToken();
      await query(
        \`INSERT INTO invitations (event_id, guest_id, token, channel)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT DO NOTHING\`,
        [req.params.eventId, guestId, token, channel]
      );

      const rsvpUrl = \`\${process.env.CLIENT_URL}/invite/\${token}\`;
      const { subject, html, text } = invitationEmail({
        guestName:    guest.name,
        eventName:    event.name,
        eventDate:    new Date(event.start_time).toLocaleDateString('en-NG', { dateStyle: 'full' }),
        venueName:    venue?.name ?? 'TBD',
        rsvpUrl,
        rsvpDeadline: event.rsvp_deadline
          ? new Date(event.rsvp_deadline).toLocaleDateString('en-NG', { dateStyle: 'full' })
          : 'ASAP',
      });

      await sendEmail({ to: guest.email, subject, html, text });

      await query(\`UPDATE invitations SET sent_at = NOW() WHERE token = $1\`, [token]);
      results.sent++;
    } catch {
      results.failed++;
    }
  }

  res.json({ success: true, data: results });
}

// POST /api/v1/invitations/rsvp — public endpoint, no auth
async function handleRsvp(req: Request, res: Response) {
  const { token, status, dietaryReq, accessibilityReq } = req.body as z.infer<typeof rsvpSchema>;

  const inv = await queryOne<{ id: string; guest_id: string; event_id: string; status: string }>(
    \`SELECT id, guest_id, event_id, status FROM invitations WHERE token = $1\`, [token]
  );
  if (!inv) throw new NotFoundError('Invitation');

  // Update invitation
  await query(
    \`UPDATE invitations SET status = 'responded', responded_at = NOW() WHERE id = $1\`, [inv.id]
  );

  // Update guest RSVP status
  const fields: Record<string, unknown> = { rsvp_status: status };
  if (dietaryReq)       fields.dietary_req       = dietaryReq;
  if (accessibilityReq) fields.accessibility_req = accessibilityReq;

  await query(
    \`UPDATE guests SET rsvp_status = $1 WHERE id = $2\`, [status, inv.guest_id]
  );

  res.json({ success: true, message: \`RSVP recorded as \${status}\` });
}

// POST /api/v1/invitations/:eventId/send-seats
async function sendSeatNotifications(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);

  const event = await queryOne<{ name: string; start_time: Date }>(
    \`SELECT name, start_time FROM events WHERE id = $1\`, [req.params.eventId]
  );
  if (!event) throw new NotFoundError('Event');

  const { guestIds } = req.body as z.infer<typeof sendSeatNotificationsSchema>;

  const whereGuests = guestIds?.length
    ? \`AND g.id = ANY($2::uuid[])\`
    : '';

  const guests = await query(
    \`SELECT g.id, g.name, g.email, sa.seat_label, sa.zone_name, i.token
     FROM guests g
     JOIN seat_assignments sa ON sa.guest_id = g.id AND sa.event_id = $1
     LEFT JOIN invitations i ON i.guest_id = g.id AND i.event_id = $1
     WHERE g.event_id = $1 AND g.email IS NOT NULL \${whereGuests}\`,
    guestIds?.length ? [req.params.eventId, guestIds] : [req.params.eventId]
  );

  const results = { sent: 0, failed: 0 };

  for (const guest of guests) {
    try {
      const seatFinderUrl = \`\${process.env.CLIENT_URL}/seat/\${guest.token}\`;
      const qrCode = await generateQRCode(seatFinderUrl);

      const { subject, html, text } = seatAssignmentEmail({
        guestName:      guest.name,
        eventName:      event.name,
        eventDate:      new Date(event.start_time).toLocaleDateString('en-NG', { dateStyle: 'full' }),
        seatLabel:      guest.seat_label,
        zoneName:       guest.zone_name,
        seatFinderUrl,
        qrCodeDataUrl:  qrCode,
      });

      await sendEmail({ to: guest.email, subject, html, text });
      results.sent++;
    } catch {
      results.failed++;
    }
  }

  res.json({ success: true, data: results });
}

// GET /api/v1/invitations/:eventId/stats
async function getInvitationStats(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);
  const [stats] = await query(
    \`SELECT
       COUNT(*) FILTER (WHERE i.status = 'sent')      AS sent,
       COUNT(*) FILTER (WHERE i.status = 'viewed')    AS viewed,
       COUNT(*) FILTER (WHERE i.status = 'responded') AS responded,
       COUNT(*)                                        AS total
     FROM invitations i WHERE i.event_id = $1\`,
    [req.params.eventId]
  );
  res.json({ success: true, data: stats });
}

// ── Router ────────────────────────────────────────────────

const router = Router();

router.post('/rsvp',                          validate(rsvpSchema),                sendInvitations as any); // handled below
router.post('/rsvp-respond',                  validate(rsvpSchema),                handleRsvp);
router.post('/:eventId/send',                 authenticate, validate(sendInvitationsSchema), sendInvitations);
router.post('/:eventId/send-seats',           authenticate, validate(sendSeatNotificationsSchema), sendSeatNotifications);
router.get ('/:eventId/stats',                authenticate, getInvitationStats);

export default router;
` },
  { p: "src/config/cloudinary.ts", c: `import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default cloudinary;
` },
  { p: "src/config/redis.ts", c: `import { createClient, RedisClientType } from 'redis';

let client: RedisClientType;

export function getRedis(): RedisClientType {
  if (!client) throw new Error('Redis not connected');
  return client;
}

export async function connectRedis(): Promise<void> {
  client = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  }) as RedisClientType;

  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  console.log('✅ Redis connected');
}

// Convenience helpers
export async function setCache(key: string, value: unknown, ttlSeconds = 3600) {
  await getRedis().setEx(key, ttlSeconds, JSON.stringify(value));
}

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await getRedis().get(key);
  return data ? (JSON.parse(data) as T) : null;
}

export async function deleteCache(key: string) {
  await getRedis().del(key);
}
` },
  { p: "src/types/index.ts", c: `import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: 'venue_owner' | 'planner' | 'guest' | 'vendor' | 'admin';
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate(page = 1, limit = 20) {
  const safePage  = Math.max(1, Number(page)  || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const offset = (safePage - 1) * safeLimit;
  return { page: safePage, limit: safeLimit, offset };
}

export function paginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
` },
  { p: "src/socket/index.ts", c: `import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../middleware/auth.middleware';

export function initSocket(io: Server) {
  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as JwtPayload;
    console.log(\`Socket connected: \${user.userId} (\${user.role})\`);

    // Join a room for each event the user is part of
    socket.on('join:event', (eventId: string) => {
      socket.join(\`event:\${eventId}\`);
    });

    socket.on('leave:event', (eventId: string) => {
      socket.leave(\`event:\${eventId}\`);
    });

    // ── Check-in events ──
    socket.on('checkin:scan', (data: { eventId: string; guestId: string }) => {
      // Emit to all planners watching this event
      io.to(\`event:\${data.eventId}\`).emit('checkin:update', {
        guestId: data.guestId,
        timestamp: new Date(),
      });
    });

    // ── Layout collaboration ──
    socket.on('layout:update', (data: { eventId: string; change: unknown }) => {
      // Broadcast layout change to all co-planners except sender
      socket.to(\`event:\${data.eventId}\`).emit('layout:change', data.change);
    });

    // ── Real-time announcements ──
    socket.on('event:announce', (data: { eventId: string; message: string }) => {
      io.to(\`event:\${data.eventId}\`).emit('event:announcement', {
        message: data.message,
        sentAt: new Date(),
        sentBy: user.userId,
      });
    });

    socket.on('disconnect', () => {
      console.log(\`Socket disconnected: \${user.userId}\`);
    });
  });
}
` },
  { p: "src/middleware/notFound.ts", c: `import { Request, Response } from 'express';

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { message: \`Route \${req.method} \${req.path} not found\`, code: 'NOT_FOUND' },
  });
}
` },
  { p: "src/middleware/validate.middleware.ts", c: `import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from './errorHandler';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors
        .map((e) => \`\${e.path.join('.')}: \${e.message}\`)
        .join(', ');
      throw new ValidationError(message);
    }
    req.body = result.data;
    next();
  };
}
` },
  { p: "src/middleware/errorHandler.ts", c: `import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(\`\${resource} not found\`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(\`[ERROR] \${err.message}\`, err.stack);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
  }

  // Postgres unique violation
  if ((err as any).code === '23505') {
    return res.status(409).json({
      success: false,
      error: { message: 'A record with this value already exists', code: 'DUPLICATE' },
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      code: 'SERVER_ERROR',
    },
  });
}
` },
  { p: "src/middleware/auth.middleware.ts", c: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from './errorHandler';
import { UserRole } from '../../shared/src/types/user.types';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError();
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(\`Role '\${req.user.role}' is not allowed here\`);
    }
    next();
  };
}
` },
  { p: "src/db/mongo/layout.model.ts", c: `import mongoose, { Schema, Document } from 'mongoose';

export interface ILayoutDocument extends Document {
  eventId: string;
  name: string;
  versionNumber: number;
  isActive: boolean;
  sceneData: {
    objects: any[];
    zones: any[];
    seats: any[];
    venueModelUrl?: string;
    gridSize: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SceneObjectSchema = new Schema({
  id:       { type: String, required: true },
  type:     { type: String, required: true },
  position: { x: Number, y: Number, z: Number },
  rotation: { x: Number, y: Number, z: Number },
  scale:    { x: Number, y: Number, z: Number },
  label:    String,
  isLocked: { type: Boolean, default: false },
}, { _id: false });

const ZoneSchema = new Schema({
  id:       { type: String, required: true },
  name:     { type: String, required: true },
  type:     { type: String, required: true },
  color:    { type: String, default: '#3B82F6' },
  vertices: [{ x: Number, z: Number }],
}, { _id: false });

const SeatSchema = new Schema({
  id:          { type: String, required: true },
  seatLabel:   { type: String, required: true },
  zoneId:      { type: String, required: true },
  category:    { type: String, default: 'general' },
  position:    { x: Number, y: Number, z: Number },
  isAccessible:{ type: Boolean, default: false },
}, { _id: false });

const LayoutSchema = new Schema<ILayoutDocument>(
  {
    eventId:       { type: String, required: true, index: true },
    name:          { type: String, required: true },
    versionNumber: { type: Number, required: true, default: 1 },
    isActive:      { type: Boolean, default: false },
    sceneData: {
      objects:        [SceneObjectSchema],
      zones:          [ZoneSchema],
      seats:          [SeatSchema],
      venueModelUrl:  String,
      gridSize:       { type: Number, default: 0.5 },
    },
  },
  { timestamps: true }
);

// Only one active layout per event
LayoutSchema.index({ eventId: 1, isActive: 1 });

export const Layout = mongoose.model<ILayoutDocument>('Layout', LayoutSchema);
` },
  { p: "src/db/mongo/client.ts", c: `import mongoose from 'mongoose';

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/eventshere_layouts';
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
}
` },
  { p: "src/db/postgres/client.ts", c: `import { Pool } from 'pg';

let pool: Pool;

export function getPool(): Pool {
  if (!pool) throw new Error('PostgreSQL not connected. Call connectPostgres() first.');
  return pool;
}

export async function connectPostgres(): Promise<void> {
  pool = new Pool({
    host:     process.env.POSTGRES_HOST     || 'localhost',
    port:     Number(process.env.POSTGRES_PORT) || 5432,
    user:     process.env.POSTGRES_USER     || 'eventshere_user',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DB       || 'eventshere_db',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test the connection
  const client = await pool.connect();
  client.release();
  console.log('✅ PostgreSQL connected');
}

export async function query<T = any>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const { rows } = await getPool().query(text, params);
  return rows as T[];
}

export async function queryOne<T = any>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
` },
  { p: "src/db/postgres/migrate.ts", c: `import { connectPostgres, getPool } from './client';
import 'dotenv/config';

const schema = \`
-- ────────────────────────────────────────────────────────────
--  EventShere PostgreSQL Schema
-- ────────────────────────────────────────────────────────────

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(30)  NOT NULL CHECK (role IN ('venue_owner','planner','guest','vendor','admin')),
  status      VARCHAR(30)  NOT NULL DEFAULT 'active'
              CHECK (status IN ('active','suspended','banned','pending_verification')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name   VARCHAR(100) NOT NULL,
  photo_url      TEXT,
  bio            TEXT,
  phone          VARCHAR(20),
  social_score   INTEGER      NOT NULL DEFAULT 500,
  score_tier     VARCHAR(20)  NOT NULL DEFAULT 'standard',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT    UNIQUE NOT NULL,
  is_revoked  BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── VENUES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venues (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(200) NOT NULL,
  short_desc       VARCHAR(160),
  full_desc        TEXT,
  type             VARCHAR(30)  NOT NULL,
  address          TEXT         NOT NULL,
  city             VARCHAR(100) NOT NULL,
  state            VARCHAR(100) NOT NULL,
  country          VARCHAR(100) NOT NULL DEFAULT 'Nigeria',
  lat              DECIMAL(10,7),
  lng              DECIMAL(10,7),
  seated_capacity  INTEGER,
  standing_capacity INTEGER,
  length_m         DECIMAL(8,2),
  width_m          DECIMAL(8,2),
  height_m         DECIMAL(8,2),
  amenities        TEXT[]       DEFAULT '{}',
  hourly_rate      DECIMAL(12,2),
  half_day_rate    DECIMAL(12,2),
  full_day_rate    DECIMAL(12,2),
  currency         VARCHAR(10)  NOT NULL DEFAULT 'NGN',
  security_deposit DECIMAL(12,2),
  cleaning_fee     DECIMAL(12,2),
  status           VARCHAR(20)  NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','pending_review','active','suspended')),
  is_verified      BOOLEAN      NOT NULL DEFAULT FALSE,
  rating           DECIMAL(3,2),
  review_count     INTEGER      NOT NULL DEFAULT 0,
  min_notice_hours INTEGER      NOT NULL DEFAULT 48,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_media (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id     UUID REFERENCES venues(id) ON DELETE CASCADE,
  media_type   VARCHAR(20) NOT NULL CHECK (media_type IN ('photo','video','floor_plan','model_3d','panorama')),
  url          TEXT        NOT NULL,
  thumbnail_url TEXT,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_availability (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id   UUID REFERENCES venues(id) ON DELETE CASCADE,
  date       DATE        NOT NULL,
  is_blocked BOOLEAN     NOT NULL DEFAULT FALSE,
  booking_id UUID,
  UNIQUE (venue_id, date)
);

CREATE TABLE IF NOT EXISTS venue_reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id         UUID REFERENCES venues(id) ON DELETE CASCADE,
  reviewer_id      UUID REFERENCES users(id),
  event_id         UUID,
  cleanliness      SMALLINT CHECK (cleanliness BETWEEN 1 AND 5),
  capacity_accuracy SMALLINT CHECK (capacity_accuracy BETWEEN 1 AND 5),
  staff_helpfulness SMALLINT CHECK (staff_helpfulness BETWEEN 1 AND 5),
  amenity_accuracy  SMALLINT CHECK (amenity_accuracy BETWEEN 1 AND 5),
  overall          SMALLINT CHECK (overall BETWEEN 1 AND 5),
  comment          TEXT,
  owner_response   TEXT,
  photos           TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── EVENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planner_id     UUID REFERENCES users(id),
  venue_id       UUID REFERENCES venues(id),
  name           VARCHAR(200) NOT NULL,
  type           VARCHAR(30)  NOT NULL,
  description    TEXT,
  start_time     TIMESTAMPTZ  NOT NULL,
  end_time       TIMESTAMPTZ  NOT NULL,
  visibility     VARCHAR(10)  NOT NULL DEFAULT 'private'
                 CHECK (visibility IN ('public','private','unlisted')),
  status         VARCHAR(20)  NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','published','ongoing','completed','cancelled')),
  max_guests     INTEGER      NOT NULL DEFAULT 100,
  rsvp_deadline  TIMESTAMPTZ,
  cover_image_url TEXT,
  slug           VARCHAR(255) UNIQUE,
  seating_mode   VARCHAR(20)  NOT NULL DEFAULT 'manual'
                 CHECK (seating_mode IN ('automatic','manual','hybrid')),
  score_influence VARCHAR(10) NOT NULL DEFAULT 'off'
                 CHECK (score_influence IN ('off','low','medium','high')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_co_planners (
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  permission  VARCHAR(10) NOT NULL DEFAULT 'editor'
              CHECK (permission IN ('viewer','editor','admin')),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS event_runsheet (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  scheduled_at TIMESTAMPTZ,
  assigned_to  VARCHAR(100),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

-- ── GUESTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id      UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id),
  name          VARCHAR(200) NOT NULL,
  email         VARCHAR(255),
  phone         VARCHAR(20),
  category      VARCHAR(20)  NOT NULL DEFAULT 'general'
                CHECK (category IN ('vip','dignitary','family','general','press','vendor_staff')),
  rsvp_status   VARCHAR(15)  NOT NULL DEFAULT 'pending'
                CHECK (rsvp_status IN ('pending','confirmed','declined','tentative','waitlisted')),
  seat_id       UUID,
  checked_in    BOOLEAN      NOT NULL DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  qr_code       TEXT,
  notes         TEXT,
  dietary_req   TEXT,
  accessibility_req TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seat_assignments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id      UUID REFERENCES guests(id) ON DELETE CASCADE,
  event_id      UUID REFERENCES events(id) ON DELETE CASCADE,
  seat_label    VARCHAR(50)  NOT NULL,
  zone_name     VARCHAR(100),
  assigned_by   VARCHAR(20)  NOT NULL DEFAULT 'manual'
                CHECK (assigned_by IN ('algorithm','manual')),
  assigned_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (guest_id, event_id)
);

-- ── BOOKINGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id          UUID REFERENCES venues(id),
  event_id          UUID REFERENCES events(id),
  planner_id        UUID REFERENCES users(id),
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','accepted','declined','counter_offered','confirmed','cancelled','completed')),
  total_amount      DECIMAL(12,2) NOT NULL,
  platform_fee      DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_status    VARCHAR(10)  NOT NULL DEFAULT 'unpaid'
                    CHECK (payment_status IN ('unpaid','partial','paid','refunded')),
  event_date        DATE         NOT NULL,
  message           TEXT,
  special_requirements TEXT,
  paystack_ref      VARCHAR(100),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── INVITATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invitations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
  guest_id     UUID REFERENCES guests(id) ON DELETE CASCADE,
  token        VARCHAR(255) UNIQUE NOT NULL,
  status       VARCHAR(15)  NOT NULL DEFAULT 'sent'
               CHECK (status IN ('sent','viewed','responded','expired')),
  sent_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  viewed_at    TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  channel      VARCHAR(15)  NOT NULL DEFAULT 'email'
               CHECK (channel IN ('email','sms','whatsapp','in_app'))
);

-- ── RATINGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rater_id          UUID REFERENCES users(id),
  ratee_id          UUID REFERENCES users(id),
  event_id          UUID REFERENCES events(id),
  conduct_score     SMALLINT CHECK (conduct_score BETWEEN 1 AND 5),
  social_score      SMALLINT CHECK (social_score BETWEEN 1 AND 5),
  punctuality_score SMALLINT CHECK (punctuality_score BETWEEN 1 AND 5),
  attire_score      SMALLINT CHECK (attire_score BETWEEN 1 AND 5),
  overall_score     SMALLINT CHECK (overall_score BETWEEN 1 AND 5),
  comment           TEXT,
  is_flagged        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (rater_id, ratee_id, event_id)
);

CREATE TABLE IF NOT EXISTS social_scores (
  user_id        UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_score  INTEGER     NOT NULL DEFAULT 500,
  tier           VARCHAR(20) NOT NULL DEFAULT 'standard',
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score_history  JSONB       NOT NULL DEFAULT '[]'
);

-- ── VENDORS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id         UUID REFERENCES events(id) ON DELETE CASCADE,
  name             VARCHAR(200) NOT NULL,
  service_type     VARCHAR(50),
  contact_email    VARCHAR(255),
  contact_phone    VARCHAR(20),
  assigned_zone    VARCHAR(100),
  confirmation_status VARCHAR(15) NOT NULL DEFAULT 'pending'
                   CHECK (confirmation_status IN ('pending','confirmed','cancelled')),
  arrival_time     TIMESTAMPTZ,
  setup_notes      TEXT,
  equipment_list   TEXT,
  qr_code          TEXT,
  arrived_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── NOTIFICATIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL,
  channel         VARCHAR(15) NOT NULL CHECK (channel IN ('push','email','sms','whatsapp')),
  title           VARCHAR(200),
  body            TEXT,
  data            JSONB,
  delivery_status VARCHAR(15) NOT NULL DEFAULT 'pending'
                  CHECK (delivery_status IN ('pending','sent','delivered','failed')),
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_venues_city          ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_status        ON venues(status);
CREATE INDEX IF NOT EXISTS idx_events_planner       ON events(planner_id);
CREATE INDEX IF NOT EXISTS idx_events_status        ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start         ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_guests_event         ON guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_rsvp          ON guests(rsvp_status);
CREATE INDEX IF NOT EXISTS idx_bookings_venue        ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_planner      ON bookings(planner_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ratee         ON ratings(ratee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user   ON refresh_tokens(user_id);
\`;

async function migrate() {
  await connectPostgres();
  const pool = getPool();
  console.log('🔄 Running migrations...');
  await pool.query(schema);
  console.log('✅ Migrations complete');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
` },
  { p: "src/utils/helpers.ts", c: `import crypto from 'crypto';
import QRCode from 'qrcode';

/** Random URL-safe token */
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/** Slugify a string for URLs */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Generate unique event slug */
export function generateSlug(name: string): string {
  const base = slugify(name);
  const suffix = crypto.randomBytes(3).toString('hex'); // e.g. "a3f9b2"
  return \`\${base}-\${suffix}\`;
}

/** Generate a QR code data URL */
export async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, { errorCorrectionLevel: 'M', width: 300 });
}

/** Strip undefined keys from an object (for SQL patch updates) */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/** Build a dynamic SET clause for SQL UPDATE */
export function buildSetClause(
  fields: Record<string, unknown>,
  startIndex = 1
): { clause: string; values: unknown[] } {
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  const clause = entries.map(([key, _], i) => \`\${key} = $\${i + startIndex}\`).join(', ');
  const values = entries.map(([, v]) => v);
  return { clause, values };
}
` },
  { p: "src/utils/email.ts", c: `import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: EmailOptions): Promise<void> {
  if (process.env.NODE_ENV === 'development' && !process.env.SENDGRID_API_KEY) {
    console.log(\`\\n📧 [DEV EMAIL] To: \${opts.to}\\nSubject: \${opts.subject}\\n\${opts.text || ''}\\n\`);
    return;
  }
  await sgMail.send({
    to: opts.to,
    from: process.env.EMAIL_FROM || 'noreply@eventshere.com',
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

// ── Email templates ────────────────────────────────────────

export function welcomeEmail(displayName: string): Pick<EmailOptions, 'subject' | 'html' | 'text'> {
  return {
    subject: 'Welcome to EventShere 🎉',
    html: \`<h2>Welcome, \${displayName}!</h2><p>Your EventShere account is ready. Start planning or discovering events today.</p>\`,
    text: \`Welcome, \${displayName}! Your EventShere account is ready.\`,
  };
}

export function invitationEmail(opts: {
  guestName: string;
  eventName: string;
  eventDate: string;
  venueName: string;
  rsvpUrl: string;
  rsvpDeadline: string;
}): Pick<EmailOptions, 'subject' | 'html' | 'text'> {
  return {
    subject: \`You're invited to \${opts.eventName}\`,
    html: \`
      <h2>Hello \${opts.guestName},</h2>
      <p>You have been invited to <strong>\${opts.eventName}</strong>.</p>
      <p><strong>Date:</strong> \${opts.eventDate}</p>
      <p><strong>Venue:</strong> \${opts.venueName}</p>
      <p>Please RSVP before <strong>\${opts.rsvpDeadline}</strong>.</p>
      <a href="\${opts.rsvpUrl}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">RSVP Now</a>
    \`,
    text: \`You're invited to \${opts.eventName} on \${opts.eventDate} at \${opts.venueName}. RSVP at: \${opts.rsvpUrl}\`,
  };
}

export function seatAssignmentEmail(opts: {
  guestName: string;
  eventName: string;
  eventDate: string;
  seatLabel: string;
  zoneName: string;
  seatFinderUrl: string;
  qrCodeDataUrl: string;
}): Pick<EmailOptions, 'subject' | 'html' | 'text'> {
  return {
    subject: \`Your seat for \${opts.eventName} — \${opts.seatLabel}\`,
    html: \`
      <h2>Hello \${opts.guestName},</h2>
      <p>Your seat for <strong>\${opts.eventName}</strong> has been assigned.</p>
      <p><strong>Seat:</strong> \${opts.seatLabel} (\${opts.zoneName})</p>
      <p><strong>Date:</strong> \${opts.eventDate}</p>
      <p>Use the link below to view your seat on the interactive 3D map:</p>
      <a href="\${opts.seatFinderUrl}">View My Seat →</a>
      <p>Present the QR code below at the entrance for check-in:</p>
      <img src="\${opts.qrCodeDataUrl}" alt="Your check-in QR code" width="200" />
    \`,
    text: \`Your seat for \${opts.eventName}: \${opts.seatLabel} (\${opts.zoneName}). View: \${opts.seatFinderUrl}\`,
  };
}

export function bookingConfirmationEmail(opts: {
  plannerName: string;
  venueName: string;
  eventDate: string;
  totalAmount: string;
  currency: string;
}): Pick<EmailOptions, 'subject' | 'html' | 'text'> {
  return {
    subject: \`Booking Confirmed — \${opts.venueName}\`,
    html: \`
      <h2>Booking Confirmed!</h2>
      <p>Hello \${opts.plannerName}, your booking for <strong>\${opts.venueName}</strong> has been confirmed.</p>
      <p><strong>Event Date:</strong> \${opts.eventDate}</p>
      <p><strong>Amount Paid:</strong> \${opts.currency} \${opts.totalAmount}</p>
    \`,
    text: \`Booking confirmed for \${opts.venueName} on \${opts.eventDate}. Amount: \${opts.currency} \${opts.totalAmount}\`,
  };
}
` },
  { p: "package.json", c: `{
  "name": "@eventshere/server",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "node -r ts-node/register src/db/postgres/migrate.ts",
    "db:seed": "node -r ts-node/register src/db/postgres/seed.ts"
  },
  "dependencies": {
    "express": "^4.19.2",
    "express-async-errors": "^3.1.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.4.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.4.0",
    "pg": "^8.11.5",
    "redis": "^4.6.14",
    "socket.io": "^4.7.5",
    "cloudinary": "^2.3.1",
    "multer": "^1.4.5-lts.1",
    "zod": "^3.23.8",
    "uuid": "^10.0.0",
    "express-rate-limit": "^7.3.1",
    "cookie-parser": "^1.4.6",
    "nodemailer": "^6.9.13",
    "@sendgrid/mail": "^8.1.3",
    "qrcode": "^1.5.3",
    "csv-parse": "^5.5.6"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/multer": "^1.4.11",
    "@types/uuid": "^10.0.0",
    "@types/cookie-parser": "^1.4.7",
    "@types/qrcode": "^1.5.5",
    "@types/node": "^20.14.2",
    "typescript": "^5.4.5",
    "ts-node-dev": "^2.0.0",
    "ts-node": "^10.9.2"
  }
}
` },
  { p: "tsconfig.json", c: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "paths": {
      "@eventshere/shared": ["../shared/src"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
` },
];


let created = 0;
let skipped = 0;
let failed  = 0;

console.log('\nEventShere Server Setup');
console.log('========================');
console.log('Creating files in: ' + BASE + '\n');

for (const file of files) {
  try {
    const fullPath = path.join(BASE, file.p);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(fullPath)) {
      console.log('  SKIP   ' + file.p);
      skipped++;
    } else {
      fs.writeFileSync(fullPath, file.c, 'utf8');
      console.log('  CREATE ' + file.p);
      created++;
    }
  } catch (err) {
    console.log('  ERROR  ' + file.p + ' -> ' + err.message);
    failed++;
  }
}

console.log('\n========================================');
console.log('Created : ' + created);
console.log('Skipped : ' + skipped);
console.log('Failed  : ' + failed);
console.log('========================================');
console.log('');
console.log('Next steps:');
console.log('  1. npm install');
console.log('  2. Rename .env.example to .env and fill in values');
console.log('  3. docker-compose up -d   (from the root folder)');
console.log('  4. npm run db:migrate');
console.log('  5. npm run dev');
console.log('');
