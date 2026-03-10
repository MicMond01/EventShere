import { query } from '../db/postgres/client';
import { NotFoundError } from '../middleware/errorHandler';
import { Layout } from '../db/mongo/layout.model';
import { GUEST_CATEGORY_PRIORITY, ZONE_CATEGORY_MAP } from '@eventshere/shared';

interface GuestRow { id: string; name: string; category: string; accessibility_req: string | null; social_score: number; }
interface Seat     { id: string; seatLabel: string; zoneId: string; category: string; isAccessible: boolean; }
interface Zone     { id: string; name: string; type: string; }

export interface SeatingResult {
  assignments: { guestId: string; guestName: string; seatLabel: string; zoneName: string }[];
  unassigned:  string[];
  conflicts:   string[];
}

export async function runSeatAlgorithm(
  eventId: string,
  useScoreInfluence: boolean
): Promise<SeatingResult> {
  const guests = await query<GuestRow>(
    `SELECT g.id, g.name, g.category, g.accessibility_req,
            COALESCE(ss.current_score, 500) AS social_score
     FROM guests g
     LEFT JOIN social_scores ss ON ss.user_id = g.user_id
     WHERE g.event_id = $1 AND g.rsvp_status = 'confirmed'`,
    [eventId]
  );
  if (!guests.length) return { assignments: [], unassigned: [], conflicts: [] };

  const layout = await Layout.findOne({ eventId, isActive: true });
  if (!layout) throw new NotFoundError('Active layout — run the 3D planner first');

  const seats: Seat[] = layout.sceneData.seats as any;
  const zones: Zone[] = layout.sceneData.zones as any;
  const zoneMap = new Map(zones.map(z => [z.id, z]));

  // Sort by category priority, then optionally by social score
  guests.sort((a, b) => {
    const p = (GUEST_CATEGORY_PRIORITY[a.category] ?? 5) - (GUEST_CATEGORY_PRIORITY[b.category] ?? 5);
    if (p !== 0) return p;
    return useScoreInfluence ? b.social_score - a.social_score : 0;
  });

  const usedSeatIds = new Set<string>();
  const assignments: SeatingResult['assignments'] = [];
  const unassigned: string[] = [];
  const conflicts:  string[] = [];

  for (const guest of guests) {
    const needsAccessible = !!guest.accessibility_req;
    const pool = needsAccessible
      ? [...seats.filter(s => s.isAccessible), ...seats.filter(s => !s.isAccessible)]
      : seats.filter(s => !s.isAccessible);

    const preferredZoneTypes = Object.entries(ZONE_CATEGORY_MAP)
      .filter(([, cats]) => cats.includes(guest.category))
      .map(([type]) => type);

    // First pass: preferred zone type
    let seat = pool.find(s => {
      if (usedSeatIds.has(s.id)) return false;
      const zone = zoneMap.get(s.zoneId);
      return zone && preferredZoneTypes.includes(zone.type);
    });

    // Second pass: any free seat
    if (!seat) seat = pool.find(s => !usedSeatIds.has(s.id));

    if (!seat) {
      unassigned.push(guest.id);
      conflicts.push(`No seat available for ${guest.name} (${guest.category})`);
      continue;
    }

    usedSeatIds.add(seat.id);
    const zone = zoneMap.get(seat.zoneId);
    assignments.push({
      guestId: guest.id, guestName: guest.name,
      seatLabel: seat.seatLabel, zoneName: zone?.name ?? 'General',
    });
  }

  // Persist
  for (const a of assignments) {
    await query(
      `INSERT INTO seat_assignments (guest_id,event_id,seat_label,zone_name,assigned_by)
       VALUES ($1,$2,$3,$4,'algorithm')
       ON CONFLICT (guest_id,event_id) DO UPDATE
         SET seat_label=EXCLUDED.seat_label, zone_name=EXCLUDED.zone_name,
             assigned_by='algorithm', assigned_at=NOW()`,
      [a.guestId, eventId, a.seatLabel, a.zoneName]
    );
  }

  return { assignments, unassigned, conflicts };
}
