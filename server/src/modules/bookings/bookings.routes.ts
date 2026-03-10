import { Router, Request, Response } from 'express';
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
  eventDate:            z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
    `SELECT id, owner_id, seated_capacity FROM venues WHERE id = $1 AND status = 'active'`, [dto.venueId]
  );
  if (!venue) throw new NotFoundError('Venue');

  const blocked = await queryOne(
    `SELECT 1 FROM venue_availability WHERE venue_id = $1 AND date = $2 AND is_blocked = TRUE`,
    [dto.venueId, dto.eventDate]
  );
  if (blocked) throw new AppError('Venue is not available on this date', 409);

  const platformFee = dto.totalAmount * PLATFORM_COMMISSION_RATE;

  const [booking] = await query(
    `INSERT INTO bookings (venue_id, event_id, planner_id, total_amount, platform_fee, event_date, message, special_requirements)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [dto.venueId, dto.eventId, plannerId, dto.totalAmount, platformFee, dto.eventDate, dto.message, dto.specialRequirements]
  );
  return booking;
}

async function respondToBooking(bookingId: string, ownerId: string, dto: z.infer<typeof respondBookingSchema>) {
  const booking = await queryOne<{ id: string; venue_id: string; status: string }>(
    `SELECT b.id, b.venue_id, b.status FROM bookings b
     JOIN venues v ON v.id = b.venue_id
     WHERE b.id = $1 AND v.owner_id = $2`,
    [bookingId, ownerId]
  );
  if (!booking) throw new ForbiddenError('Booking not found or not your venue');
  if (booking.status !== 'pending') throw new AppError('Booking already responded to', 409);

  const statusMap: Record<string, string> = {
    accept: 'accepted', decline: 'declined', counter_offer: 'counter_offered',
  };

  const [updated] = await query(
    `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [statusMap[dto.action], bookingId]
  );

  // If accepted, block the date
  if (dto.action === 'accept') {
    await query(
      `INSERT INTO venue_availability (venue_id, date, is_blocked, booking_id)
       VALUES ($1, $2, TRUE, $3)
       ON CONFLICT (venue_id, date) DO UPDATE SET is_blocked = TRUE, booking_id = EXCLUDED.booking_id`,
      [booking.venue_id, updated.event_date, bookingId]
    );
    // Link booking to event
    await query(`UPDATE events SET venue_id = (SELECT venue_id FROM bookings WHERE id = $1) WHERE id = (SELECT event_id FROM bookings WHERE id = $1)`, [bookingId]);
  }

  return updated;
}

async function confirmBooking(bookingId: string, plannerId: string) {
  const booking = await queryOne<{ planner_id: string; status: string }>(
    `SELECT planner_id, status FROM bookings WHERE id = $1`, [bookingId]
  );
  if (!booking) throw new NotFoundError('Booking');
  if (booking.planner_id !== plannerId) throw new ForbiddenError();
  if (booking.status !== 'accepted') throw new AppError('Booking must be accepted before confirming', 400);

  const [updated] = await query(
    `UPDATE bookings SET status = 'confirmed', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [bookingId]
  );
  return updated;
}

async function getMyBookings(userId: string, role: string) {
  if (role === 'planner') {
    return query(
      `SELECT b.*, v.name AS venue_name, v.city AS venue_city, e.name AS event_name
       FROM bookings b
       JOIN venues v ON v.id = b.venue_id
       JOIN events e ON e.id = b.event_id
       WHERE b.planner_id = $1 ORDER BY b.created_at DESC`,
      [userId]
    );
  }
  // venue_owner: bookings for their venues
  return query(
    `SELECT b.*, v.name AS venue_name, e.name AS event_name, p.display_name AS planner_name
     FROM bookings b
     JOIN venues v ON v.id = b.venue_id
     JOIN events e ON e.id = b.event_id
     JOIN user_profiles p ON p.user_id = b.planner_id
     WHERE v.owner_id = $1 ORDER BY b.created_at DESC`,
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
