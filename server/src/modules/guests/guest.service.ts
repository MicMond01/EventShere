import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError, ForbiddenError, AppError } from '../../middleware/errorHandler';
import { buildSetClause, generateToken, generateQRCode } from '../../utils/helpers';
import { AddGuestDto, UpdateGuestDto } from './guest.schemas';
import { Server as SocketServer } from 'socket.io';

// ── CRUD ──────────────────────────────────────────────────

export async function addGuest(eventId: string, requesterId: string, dto: AddGuestDto) {
  await assertPlannerOwns(eventId, requesterId);

  // Check capacity
  const event = await queryOne<{ max_guests: number }>(
    `SELECT max_guests FROM events WHERE id = $1`, [eventId]
  );
  const { count } = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::int AS count FROM guests WHERE event_id = $1 AND rsvp_status != 'declined'`, [eventId]
  ) as any;

  const qrData = `eventshere:checkin:${generateToken(16)}`;
  const qrCode = await generateQRCode(qrData);

  const rsvpStatus = count >= (event?.max_guests ?? 0) ? 'waitlisted' : 'pending';

  const [guest] = await query(
    `INSERT INTO guests (event_id, name, email, phone, category, rsvp_status, notes, dietary_req, accessibility_req, qr_code)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
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

  const conditions = [`event_id = $1`];
  const values: unknown[] = [eventId];
  let idx = 2;

  if (filters.category)   { conditions.push(`category = $${idx++}`);    values.push(filters.category); }
  if (filters.rsvpStatus) { conditions.push(`rsvp_status = $${idx++}`); values.push(filters.rsvpStatus); }

  const page   = Math.max(1, Number(filters.page)  || 1);
  const limit  = Math.min(200, Number(filters.limit) || 50);
  const offset = (page - 1) * limit;

  const where = conditions.join(' AND ');
  const [{ count }] = await query<{ count: string }>(`SELECT COUNT(*) FROM guests WHERE ${where}`, values) as any;

  const rows = await query(
    `SELECT g.*, sa.seat_label, sa.zone_name
     FROM guests g
     LEFT JOIN seat_assignments sa ON sa.guest_id = g.id AND sa.event_id = $1
     WHERE ${where}
     ORDER BY g.category, g.name
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...values, limit, offset]
  );

  return { data: rows, total: Number(count), page, limit };
}

export async function getGuestById(guestId: string) {
  const guest = await queryOne(
    `SELECT g.*, sa.seat_label, sa.zone_name
     FROM guests g
     LEFT JOIN seat_assignments sa ON sa.guest_id = g.id
     WHERE g.id = $1`,
    [guestId]
  );
  if (!guest) throw new NotFoundError('Guest');
  return guest;
}

export async function updateGuest(guestId: string, requesterId: string, dto: UpdateGuestDto) {
  const guest = await queryOne<{ event_id: string }>(`SELECT event_id FROM guests WHERE id = $1`, [guestId]);
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
    `UPDATE guests SET ${clause} WHERE id = $${values.length + 1} RETURNING *`,
    [...values, guestId]
  );
  return updated;
}

export async function removeGuest(guestId: string, requesterId: string) {
  const guest = await queryOne<{ event_id: string }>(`SELECT event_id FROM guests WHERE id = $1`, [guestId]);
  if (!guest) throw new NotFoundError('Guest');
  await assertPlannerOwns(guest.event_id, requesterId);
  await query(`DELETE FROM guests WHERE id = $1`, [guestId]);
}

// ── CHECK-IN ──────────────────────────────────────────────

export async function checkInGuest(eventId: string, requesterId: string, dto: { qrCode?: string; guestId?: string }, io?: SocketServer) {
  await assertPlannerOwns(eventId, requesterId);

  let guest: any;
  if (dto.qrCode) {
    guest = await queryOne(`SELECT * FROM guests WHERE qr_code = $1 AND event_id = $2`, [dto.qrCode, eventId]);
  } else if (dto.guestId) {
    guest = await queryOne(`SELECT * FROM guests WHERE id = $1 AND event_id = $2`, [dto.guestId, eventId]);
  }

  if (!guest) throw new NotFoundError('Guest');
  if (guest.checked_in) throw new AppError('Guest already checked in', 409);

  const [updated] = await query(
    `UPDATE guests SET checked_in = TRUE, checked_in_at = NOW() WHERE id = $1 RETURNING *`,
    [guest.id]
  );

  // Real-time update to all planner dashboards watching this event
  if (io) {
    io.to(`event:${eventId}`).emit('checkin:update', {
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
    `SELECT
       COUNT(*) FILTER (WHERE rsvp_status = 'confirmed') AS confirmed,
       COUNT(*) FILTER (WHERE checked_in = TRUE) AS checked_in,
       COUNT(*) FILTER (WHERE rsvp_status = 'confirmed' AND checked_in = FALSE) AS not_arrived,
       COUNT(*) AS total
     FROM guests WHERE event_id = $1`,
    [eventId]
  );
  return stats;
}

// ── SEAT ASSIGNMENT ───────────────────────────────────────

export async function assignSeat(
  guestId: string, eventId: string, seatLabel: string, zoneName: string,
  requesterId: string, assignedBy: 'manual' | 'algorithm' = 'manual'
) {
  const guest = await queryOne<{ event_id: string }>(`SELECT event_id FROM guests WHERE id = $1`, [guestId]);
  if (!guest) throw new NotFoundError('Guest');
  if (assignedBy === 'manual') await assertPlannerOwns(guest.event_id, requesterId);

  await query(
    `INSERT INTO seat_assignments (guest_id, event_id, seat_label, zone_name, assigned_by)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (guest_id, event_id) DO UPDATE
       SET seat_label = EXCLUDED.seat_label,
           zone_name  = EXCLUDED.zone_name,
           assigned_by= EXCLUDED.assigned_by,
           assigned_at= NOW()`,
    [guestId, eventId, seatLabel, zoneName, assignedBy]
  );
}

export async function getGuestByInvitationToken(token: string) {
  const inv = await queryOne(
    `SELECT i.*, g.name, g.email, g.category, g.rsvp_status,
            e.name AS event_name, e.start_time, e.end_time,
            v.name AS venue_name, v.address AS venue_address,
            sa.seat_label, sa.zone_name
     FROM invitations i
     JOIN guests g ON g.id = i.guest_id
     JOIN events e ON e.id = i.event_id
     LEFT JOIN venues v ON v.id = e.venue_id
     LEFT JOIN seat_assignments sa ON sa.guest_id = g.id AND sa.event_id = e.id
     WHERE i.token = $1`,
    [token]
  );
  if (!inv) throw new NotFoundError('Invitation');
  return inv;
}

// ── HELPERS ───────────────────────────────────────────────

async function assertPlannerOwns(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(
    `SELECT planner_id FROM events WHERE id = $1`, [eventId]
  );
  if (!event) throw new NotFoundError('Event');

  if (event.planner_id === userId) return;

  const co = await queryOne(
    `SELECT 1 FROM event_co_planners WHERE event_id = $1 AND user_id = $2 AND permission IN ('editor','admin')`,
    [eventId, userId]
  );
  if (!co) throw new ForbiddenError('You do not have access to this event');
}
