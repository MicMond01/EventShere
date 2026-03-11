import { query, queryOne } from '../db/postgres/client';
import { NotFoundError } from '../middleware/errorHandler';
import { paginate } from '../utils/helpers';

export async function getPlatformStats() {
  const [stats] = await query(`
    SELECT
      (SELECT COUNT(*) FROM users)                                  AS total_users,
      (SELECT COUNT(*) FROM users WHERE role='planner')            AS planners,
      (SELECT COUNT(*) FROM users WHERE role='venue_owner')        AS venue_owners,
      (SELECT COUNT(*) FROM venues WHERE status='active')          AS active_venues,
      (SELECT COUNT(*) FROM venues WHERE status='pending_review')  AS pending_venues,
      (SELECT COUNT(*) FROM events WHERE status='published')       AS published_events,
      (SELECT COUNT(*) FROM bookings WHERE status='confirmed')     AS confirmed_bookings,
      (SELECT COALESCE(SUM(platform_fee),0) FROM bookings WHERE payment_status='paid') AS total_revenue
  `);
  return stats;
}

export async function listUsers(params: Record<string, string>) {
  const { limit, offset } = paginate(Number(params.page), Number(params.limit));
  const search = params.search ? `%${params.search.toLowerCase()}%` : null;
  const rows = search
    ? await query(
        `SELECT u.id,u.email,u.role,u.status,u.created_at,p.display_name
         FROM users u JOIN user_profiles p ON p.user_id=u.id
         WHERE LOWER(u.email) LIKE $1 OR LOWER(p.display_name) LIKE $1
         ORDER BY u.created_at DESC LIMIT $2 OFFSET $3`,
        [search, limit, offset]
      )
    : await query(
        `SELECT u.id,u.email,u.role,u.status,u.created_at,p.display_name
         FROM users u JOIN user_profiles p ON p.user_id=u.id
         ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
  return rows;
}

export async function updateUserStatus(userId: string, status: string) {
  const user = await queryOne(`SELECT id FROM users WHERE id = $1`, [userId]);
  if (!user) throw new NotFoundError('User');
  await query(`UPDATE users SET status=$1, updated_at=NOW() WHERE id=$2`, [status, userId]);
}

export async function getPendingVenues() {
  return query(
    `SELECT v.*, p.display_name AS owner_name
     FROM venues v JOIN user_profiles p ON p.user_id=v.owner_id
     WHERE v.status='pending_review' ORDER BY v.created_at ASC`
  );
}

export async function reviewVenue(venueId: string, action: 'approve' | 'reject') {
  const status = action === 'approve' ? 'active' : 'suspended';
  await query(`UPDATE venues SET status=$1, updated_at=NOW() WHERE id=$2`, [status, venueId]);
}

export async function getFlaggedRatings() {
  return query(
    `SELECT r.*, rp.display_name AS ratee_name, e.name AS event_name
     FROM ratings r
     JOIN user_profiles rp ON rp.user_id=r.ratee_id
     JOIN events e ON e.id=r.event_id
     WHERE r.is_flagged=TRUE ORDER BY r.created_at DESC`
  );
}

export async function deleteRating(ratingId: string) {
  await query(`DELETE FROM ratings WHERE id=$1`, [ratingId]);
}

export async function getEvents(params: Record<string, string>) {
  const { limit, offset } = paginate(Number(params.page), Number(params.limit));
  const search = params.search ? `%${params.search.toLowerCase()}%` : null;
  const rows = search
    ? await query(
        `SELECT e.*, p.display_name AS owner_name
         FROM events e JOIN user_profiles p ON p.user_id=e.owner_id
         WHERE LOWER(e.name) LIKE $1 OR LOWER(p.display_name) LIKE $1
         ORDER BY e.created_at DESC LIMIT $2 OFFSET $3`,
        [search, limit, offset]
      )
    : await query(
        `SELECT e.*, p.display_name AS owner_name
         FROM events e JOIN user_profiles p ON p.user_id=e.owner_id
         ORDER BY e.created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
  return rows;
}

export async function updateEventStatus(eventId: string, status: string) {
  const event = await queryOne(`SELECT id FROM events WHERE id = $1`, [eventId]);
  if (!event) throw new NotFoundError('Event');
  await query(`UPDATE events SET status=$1, updated_at=NOW() WHERE id=$2`, [status, eventId]);
}

export async function deleteEvent(eventId: string) {
  await query(`DELETE FROM events WHERE id=$1`, [eventId]);
}

export async function getBookings(params: Record<string, string>) {
  const { limit, offset } = paginate(Number(params.page), Number(params.limit));
  const search = params.search ? `%${params.search.toLowerCase()}%` : null;
  const rows = search
    ? await query(
        `SELECT b.*, u.email AS user_email, v.name AS venue_name
         FROM bookings b JOIN users u ON u.id=b.user_id
         JOIN venues v ON v.id=b.venue_id
         WHERE LOWER(u.email) LIKE $1 OR LOWER(v.name) LIKE $1
         ORDER BY b.created_at DESC LIMIT $2 OFFSET $3`,
        [search, limit, offset]
      )
    : await query(
        `SELECT b.*, u.email AS user_email, v.name AS venue_name
         FROM bookings b JOIN users u ON u.id=b.user_id
         JOIN venues v ON v.id=b.venue_id
         ORDER BY b.created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
  return rows;
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const booking = await queryOne(`SELECT id FROM bookings WHERE id = $1`, [bookingId]);
  if (!booking) throw new NotFoundError('Booking');
  await query(`UPDATE bookings SET status=$1, updated_at=NOW() WHERE id=$2`, [status, bookingId]);
}

export async function deleteBooking(bookingId: string) {
  await query(`DELETE FROM bookings WHERE id=$1`, [bookingId]);
}



