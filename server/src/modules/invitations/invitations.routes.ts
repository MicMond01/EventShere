import { Router, Request, Response } from 'express';
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
    `SELECT planner_id FROM events WHERE id = $1`, [eventId]
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
    `SELECT name, start_time, rsvp_deadline FROM events WHERE id = $1`, [req.params.eventId]
  );
  if (!event) throw new NotFoundError('Event');

  const venue = await queryOne<{ name: string }>(
    `SELECT v.name FROM venues v JOIN events e ON e.venue_id = v.id WHERE e.id = $1`,
    [req.params.eventId]
  );

  const results = { sent: 0, failed: 0 };

  for (const guestId of guestIds) {
    try {
      const guest = await queryOne<{ id: string; name: string; email: string }>(
        `SELECT id, name, email FROM guests WHERE id = $1 AND event_id = $2`,
        [guestId, req.params.eventId]
      );
      if (!guest || !guest.email) continue;

      const token = generateToken();
      await query(
        `INSERT INTO invitations (event_id, guest_id, token, channel)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT DO NOTHING`,
        [req.params.eventId, guestId, token, channel]
      );

      const rsvpUrl = `${process.env.CLIENT_URL}/invite/${token}`;
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

      await query(`UPDATE invitations SET sent_at = NOW() WHERE token = $1`, [token]);
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
    `SELECT id, guest_id, event_id, status FROM invitations WHERE token = $1`, [token]
  );
  if (!inv) throw new NotFoundError('Invitation');

  // Update invitation
  await query(
    `UPDATE invitations SET status = 'responded', responded_at = NOW() WHERE id = $1`, [inv.id]
  );

  // Update guest RSVP status
  const fields: Record<string, unknown> = { rsvp_status: status };
  if (dietaryReq)       fields.dietary_req       = dietaryReq;
  if (accessibilityReq) fields.accessibility_req = accessibilityReq;

  await query(
    `UPDATE guests SET rsvp_status = $1 WHERE id = $2`, [status, inv.guest_id]
  );

  res.json({ success: true, message: `RSVP recorded as ${status}` });
}

// POST /api/v1/invitations/:eventId/send-seats
async function sendSeatNotifications(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);

  const event = await queryOne<{ name: string; start_time: Date }>(
    `SELECT name, start_time FROM events WHERE id = $1`, [req.params.eventId]
  );
  if (!event) throw new NotFoundError('Event');

  const { guestIds } = req.body as z.infer<typeof sendSeatNotificationsSchema>;

  const whereGuests = guestIds?.length
    ? `AND g.id = ANY($2::uuid[])`
    : '';

  const guests = await query(
    `SELECT g.id, g.name, g.email, sa.seat_label, sa.zone_name, i.token
     FROM guests g
     JOIN seat_assignments sa ON sa.guest_id = g.id AND sa.event_id = $1
     LEFT JOIN invitations i ON i.guest_id = g.id AND i.event_id = $1
     WHERE g.event_id = $1 AND g.email IS NOT NULL ${whereGuests}`,
    guestIds?.length ? [req.params.eventId, guestIds] : [req.params.eventId]
  );

  const results = { sent: 0, failed: 0 };

  for (const guest of guests) {
    try {
      const seatFinderUrl = `${process.env.CLIENT_URL}/seat/${guest.token}`;
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
    `SELECT
       COUNT(*) FILTER (WHERE i.status = 'sent')      AS sent,
       COUNT(*) FILTER (WHERE i.status = 'viewed')    AS viewed,
       COUNT(*) FILTER (WHERE i.status = 'responded') AS responded,
       COUNT(*)                                        AS total
     FROM invitations i WHERE i.event_id = $1`,
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
