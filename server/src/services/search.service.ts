import { query } from '../db/postgres/client';

export async function search(q: string, type: string) {
  if (!q || q.length < 2) return { venues: [], events: [] };
  const pattern = `%${q.toLowerCase()}%`;
  const result: Record<string, unknown[]> = {};

  if (type === 'venues' || type === 'all') {
    result.venues = await query(
      `SELECT id,name,short_desc,type,city,state,seated_capacity,full_day_rate,currency,rating,is_verified,
              (SELECT url FROM venue_media WHERE venue_id=venues.id AND media_type='photo' ORDER BY sort_order LIMIT 1) AS cover_photo
       FROM venues
       WHERE status='active' AND (LOWER(name) LIKE $1 OR LOWER(city) LIKE $1 OR LOWER(short_desc) LIKE $1)
       ORDER BY rating DESC NULLS LAST LIMIT 10`,
      [pattern]
    );
  }

  if (type === 'events' || type === 'all') {
    result.events = await query(
      `SELECT e.id,e.name,e.type,e.slug,e.start_time,e.cover_image_url,v.name AS venue_name,v.city AS venue_city
       FROM events e LEFT JOIN venues v ON v.id = e.venue_id
       WHERE e.visibility='public' AND e.status='published'
         AND (LOWER(e.name) LIKE $1 OR LOWER(e.description) LIKE $1)
       ORDER BY e.start_time ASC LIMIT 10`,
      [pattern]
    );
  }

  return result;
}
