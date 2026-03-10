import { query, queryOne } from '../db/postgres/client';
import { NotFoundError, ForbiddenError, AppError, ConflictError } from '../middleware/errorHandler';
import { buildSetClause, generateToken, paginate } from '../utils/helpers';
import { generateQRCode } from '../utils/qrcode';
import { AddGuestDto, UpdateGuestDto, CheckInDto } from '../schemas/guest.schemas';
import { Server as SocketServer } from 'socket.io';

async function assertCanManage(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(`SELECT planner_id FROM events WHERE id = $1`, [eventId]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id === userId) return;
  const co = await queryOne(
    `SELECT 1 FROM event_co_planners WHERE event_id = $1 AND user_id = $2 AND permission IN ('editor','admin')`,
    [eventId, userId]
  );
  if (!co) throw new ForbiddenError('You do not have access to manage this event');
}

export async function addGuest(eventId: string, requesterId: string, dto: AddGuestDto) {
  await assertCanManage(eventId, requesterId);
  const event = await queryOne<{ max_guests: number }>(`SELECT max_guests FROM events WHERE id = $1`, [eventId]);
  const [{ count }] = await query<any>(
    `SELECT COUNT(*) FROM guests WHERE event_id = $1 AND rsvp_status != 'declined'`, [eventId]
  );
  const rsvpStatus = Number(count) >= (event?.max_guests ?? 0) ? 'waitlisted' : 'pending';
  const qrData = `eventshere:checkin:${generateToken(16)}`;
  const qrCode = await generateQRCode(qrData);
  const [guest] = await query(
    `INSERT INTO guests (event_id,name,email,phone,category,rsvp_status,notes,dietary_req,accessibility_req,qr_code)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [eventId,dto.name,dto.email,dto.phone,dto.category,rsvpStatus,dto.notes,dto.dietaryReq,dto.accessibilityReq,qrCode]
  );
  return guest;
}

export async function bulkAddGuests(eventId: string, requesterId: string, guests: AddGuestDto[]) {
  await assertCanManage(eventId, requesterId);
  const results = await Promise.allSettled(guests.map(g => addGuest(eventId, requesterId, g)));
  return {
    succeeded: results.filter(r => r.status === 'fulfilled').length,
    failed:    results.filter(r => r.status === 'rejected').length,
    total:     guests.length,
  };
}

export async function getGuests(eventId: string, requesterId: string, filters: Record<string, string>) {
  await assertCanManage(eventId, requesterId);
  const { page, limit, offset } = paginate(Number(filters.page), Number(filters.limit));
  const conditions = [`g.event_id = $1`];
  const values: unknown[] = [eventId];
  let i = 2;
  if (filters.category)   { conditions.push(`g.category = $${i++}`);    values.push(filters.category); }
  if (filters.rsvpStatus) { conditions.push(`g.rsvp_status = $${i++}`); values.push(filters.rsvpStatus); }
  const where = conditions.join(' AND ');
  const [{ count }] = await query<any>(`SELECT COUNT(*) FROM guests g WHERE ${where}`, values);
  const rows = await query(
    `SELECT g.*, sa.seat_label, sa.zone_name
     FROM guests g LEFT JOIN seat_assignments sa ON sa.guest_id = g.id AND sa.event_id = $1
     WHERE ${where} ORDER BY g.category, g.name LIMIT $${i++} OFFSET $${i++}`,
    [...values, limit, offset]
  );
  return { data: rows, total: Number(count), page, limit };
}

export async function updateGuest(guestId: string, requesterId: string, dto: UpdateGuestDto) {
  const guest = await queryOne<{ event_id: string }>(`SELECT event_id FROM guests WHERE id = $1`, [guestId]);
  if (!guest) throw new NotFoundError('Guest');
  await assertCanManage(guest.event_id, requesterId);
  const fields: Record<string, unknown> = {};
  if (dto.name             !== undefined) fields.name              = dto.name;
  if (dto.email            !== undefined) fields.email             = dto.email;
  if (dto.phone            !== undefined) fields.phone             = dto.phone;
  if (dto.category         !== undefined) fields.category          = dto.category;
  if (dto.rsvpStatus       !== undefined) fields.rsvp_status       = dto.rsvpStatus;
  if (dto.notes            !== undefined) fields.notes             = dto.notes;
  if (dto.dietaryReq       !== undefined) fields.dietary_req       = dto.dietaryReq;
  if (dto.accessibilityReq !== undefined) fields.accessibility_req = dto.accessibilityReq;
  const { clause, values } = buildSetClause(fields);
  const [updated] = await query(
    `UPDATE guests SET ${clause} WHERE id = $${values.length+1} RETURNING *`, [...values, guestId]
  );
  return updated;
}

export async function removeGuest(guestId: string, requesterId: string) {
  const guest = await queryOne<{ event_id: string }>(`SELECT event_id FROM guests WHERE id = $1`, [guestId]);
  if (!guest) throw new NotFoundError('Guest');
  await assertCanManage(guest.event_id, requesterId);
  await query(`DELETE FROM guests WHERE id = $1`, [guestId]);
}

export async function checkInGuest(eventId: string, requesterId: string, dto: CheckInDto, io?: SocketServer) {
  await assertCanManage(eventId, requesterId);
  let guest: any;
  if (dto.qrCode)       guest = await queryOne(`SELECT * FROM guests WHERE qr_code = $1 AND event_id = $2`, [dto.qrCode, eventId]);
  else if (dto.guestId) guest = await queryOne(`SELECT * FROM guests WHERE id = $1 AND event_id = $2`, [dto.guestId, eventId]);
  if (!guest) throw new NotFoundError('Guest');
  if (guest.checked_in) throw new ConflictError('Guest already checked in');
  const [updated] = await query(
    `UPDATE guests SET checked_in = TRUE, checked_in_at = NOW() WHERE id = $1 RETURNING *`, [guest.id]
  );
  if (io) {
    io.to(`event:${eventId}`).emit('checkin:update', {
      guestId: guest.id, guestName: guest.name,
      checkedInAt: updated.checked_in_at,
    });
  }
  return updated;
}

export async function getCheckinStats(eventId: string, requesterId: string) {
  await assertCanManage(eventId, requesterId);
  const [stats] = await query(
    `SELECT
       COUNT(*) FILTER (WHERE rsvp_status = 'confirmed') AS confirmed,
       COUNT(*) FILTER (WHERE checked_in = TRUE)         AS checked_in,
       COUNT(*) FILTER (WHERE rsvp_status = 'confirmed' AND checked_in = FALSE) AS not_arrived,
       COUNT(*) AS total
     FROM guests WHERE event_id = $1`,
    [eventId]
  );
  return stats;
}

export async function getGuestByToken(token: string) {
  const inv = await queryOne(
    `SELECT i.token, g.name, g.email, g.category, g.rsvp_status,
            e.name AS event_name, e.start_time, e.end_time,
            v.name AS venue_name, v.address AS venue_address,
            sa.seat_label, sa.zone_name
     FROM invitations i
     JOIN guests g  ON g.id  = i.guest_id
     JOIN events e  ON e.id  = i.event_id
     LEFT JOIN venues v ON v.id = e.venue_id
     LEFT JOIN seat_assignments sa ON sa.guest_id = g.id AND sa.event_id = e.id
     WHERE i.token = $1`,
    [token]
  );
  if (!inv) throw new NotFoundError('Invitation');
  return inv;
}
