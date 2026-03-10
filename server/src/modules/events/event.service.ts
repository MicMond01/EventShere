import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError, ForbiddenError, ConflictError } from '../../middleware/errorHandler';
import { generateSlug, buildSetClause } from '../../utils/helpers';
import { CreateEventDto, UpdateEventDto, AddCoPlannerDto, AddRunsheetItemDto } from './event.schemas';

// ── CRUD ──────────────────────────────────────────────────

export async function createEvent(plannerId: string, dto: CreateEventDto) {
  const slug = generateSlug(dto.name);
  const [event] = await query(
    `INSERT INTO events (
       planner_id, venue_id, name, type, description,
       start_time, end_time, visibility, max_guests,
       rsvp_deadline, cover_image_url, slug, seating_mode, score_influence
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
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
    `SELECT e.*, p.display_name AS planner_name, v.name AS venue_name, v.city AS venue_city
     FROM events e
     JOIN user_profiles p ON p.user_id = e.planner_id
     LEFT JOIN venues v ON v.id = e.venue_id
     WHERE e.id = $1`,
    [id]
  );
  if (!event) throw new NotFoundError('Event');

  // Check access for private events
  if (event.visibility === 'private' && event.planner_id !== requesterId) {
    const isCo = await queryOne(
      `SELECT 1 FROM event_co_planners WHERE event_id = $1 AND user_id = $2`,
      [id, requesterId]
    );
    if (!isCo) throw new ForbiddenError('This event is private');
  }

  const runsheet = await query(
    `SELECT * FROM event_runsheet WHERE event_id = $1 ORDER BY sort_order, scheduled_at`,
    [id]
  );
  return { ...event, runsheet };
}

export async function getEventBySlug(slug: string) {
  const event = await queryOne(
    `SELECT e.*, p.display_name AS planner_name, v.name AS venue_name, v.address AS venue_address
     FROM events e
     JOIN user_profiles p ON p.user_id = e.planner_id
     LEFT JOIN venues v ON v.id = e.venue_id
     WHERE e.slug = $1 AND e.visibility = 'public'`,
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
    `UPDATE events SET ${clause} WHERE id = $${values.length + 1} RETURNING *`,
    [...values, id]
  );
  return updated;
}

export async function deleteEvent(id: string, requesterId: string) {
  const event = await queryOne<{ planner_id: string }>(`SELECT planner_id FROM events WHERE id = $1`, [id]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== requesterId) throw new ForbiddenError();
  await query(`DELETE FROM events WHERE id = $1`, [id]);
}

export async function getMyEvents(plannerId: string) {
  return query(
    `SELECT e.*,
            (SELECT COUNT(*) FROM guests g WHERE g.event_id = e.id) AS guest_count,
            (SELECT COUNT(*) FROM guests g WHERE g.event_id = e.id AND g.rsvp_status = 'confirmed') AS confirmed_count
     FROM events e
     WHERE e.planner_id = $1
     ORDER BY e.start_time DESC`,
    [plannerId]
  );
}

export async function getPublicEvents(params: { page?: string; limit?: string; type?: string; city?: string }) {
  const page  = Math.max(1, Number(params.page)  || 1);
  const limit = Math.min(50, Number(params.limit) || 20);
  const offset = (page - 1) * limit;

  const conditions = [`e.visibility = 'public'`, `e.status = 'published'`, `e.start_time > NOW()`];
  const values: unknown[] = [];
  let idx = 1;

  if (params.type) { conditions.push(`e.type = $${idx++}`); values.push(params.type); }
  if (params.city) { conditions.push(`LOWER(v.city) LIKE $${idx++}`); values.push(`%${params.city.toLowerCase()}%`); }

  const where = conditions.join(' AND ');
  const rows = await query(
    `SELECT e.id, e.name, e.type, e.slug, e.start_time, e.cover_image_url,
            v.name AS venue_name, v.city AS venue_city,
            (SELECT COUNT(*) FROM guests g WHERE g.event_id = e.id) AS rsvp_count
     FROM events e
     LEFT JOIN venues v ON v.id = e.venue_id
     WHERE ${where}
     ORDER BY e.start_time ASC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...values, limit, offset]
  );
  return rows;
}

// ── CO-PLANNERS ───────────────────────────────────────────

export async function addCoPlanner(eventId: string, requesterId: string, dto: AddCoPlannerDto) {
  const event = await queryOne<{ planner_id: string }>(`SELECT planner_id FROM events WHERE id = $1`, [eventId]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== requesterId) throw new ForbiddenError();

  const invitee = await queryOne<{ id: string }>(`SELECT id FROM users WHERE email = $1`, [dto.email]);
  if (!invitee) throw new NotFoundError('User with that email');

  await query(
    `INSERT INTO event_co_planners (event_id, user_id, permission)
     VALUES ($1, $2, $3)
     ON CONFLICT (event_id, user_id) DO UPDATE SET permission = EXCLUDED.permission`,
    [eventId, invitee.id, dto.permission]
  );
}

export async function removeCoPlanner(eventId: string, requesterId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(`SELECT planner_id FROM events WHERE id = $1`, [eventId]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== requesterId) throw new ForbiddenError();
  await query(`DELETE FROM event_co_planners WHERE event_id = $1 AND user_id = $2`, [eventId, userId]);
}

// ── RUNSHEET ──────────────────────────────────────────────

export async function addRunsheetItem(eventId: string, requesterId: string, dto: AddRunsheetItemDto) {
  await assertCanEdit(eventId, requesterId);
  const [item] = await query(
    `INSERT INTO event_runsheet (event_id, title, description, scheduled_at, assigned_to, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [eventId, dto.title, dto.description, dto.scheduledAt, dto.assignedTo, dto.sortOrder]
  );
  return item;
}

export async function toggleRunsheetItem(itemId: string, requesterId: string) {
  const item = await queryOne<{ event_id: string; is_completed: boolean }>(
    `SELECT event_id, is_completed FROM event_runsheet WHERE id = $1`, [itemId]
  );
  if (!item) throw new NotFoundError('Runsheet item');
  await assertCanEdit(item.event_id, requesterId);

  const [updated] = await query(
    `UPDATE event_runsheet SET is_completed = NOT is_completed WHERE id = $1 RETURNING *`,
    [itemId]
  );
  return updated;
}

// ── HELPERS ───────────────────────────────────────────────

async function assertCanEdit(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(
    `SELECT planner_id FROM events WHERE id = $1`, [eventId]
  );
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id === userId) return;

  const co = await queryOne<{ permission: string }>(
    `SELECT permission FROM event_co_planners WHERE event_id = $1 AND user_id = $2`,
    [eventId, userId]
  );
  if (!co || co.permission === 'viewer') throw new ForbiddenError();
}
