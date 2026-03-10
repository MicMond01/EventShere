/**
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
    `SELECT g.id, g.name, g.category, g.rsvp_status, g.accessibility_req,
            ss.current_score AS social_score
     FROM guests g
     LEFT JOIN social_scores ss ON ss.user_id = g.user_id
     WHERE g.event_id = $1 AND g.rsvp_status = 'confirmed'`,
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
      conflicts.push(`No seat available for ${guest.name} (${guest.category})`);
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
      `INSERT INTO seat_assignments (guest_id, event_id, seat_label, zone_name, assigned_by)
       VALUES ($1,$2,$3,$4,'algorithm')
       ON CONFLICT (guest_id, event_id) DO UPDATE
         SET seat_label = EXCLUDED.seat_label,
             zone_name  = EXCLUDED.zone_name,
             assigned_by= 'algorithm',
             assigned_at= NOW()`,
      [a.guestId, eventId, a.seatLabel, a.zoneName]
    );
  }

  return { assignments, unassigned, conflicts };
}
