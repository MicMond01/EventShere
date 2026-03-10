import { query, queryOne } from "../db/postgres/client";
import { NotFoundError, ForbiddenError } from "../middleware/errorHandler";
import { generateToken } from "../utils/helpers";
import { generateQRCode } from "../utils/qrcode";
import {
  sendEmail,
  invitationTemplate,
  seatAssignmentTemplate,
} from "../utils/email";
import { env } from "../config/env";
import {
  SendInvitationsDto,
  RsvpRespondDto,
  SendSeatNotificationsDto,
} from "../schemas/invitation.schemas";

async function assertPlannerOwns(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(
    `SELECT planner_id FROM events WHERE id=$1`,
    [eventId],
  );
  if (!event) throw new NotFoundError("Event");
  if (event.planner_id !== userId) throw new ForbiddenError();
}

export async function sendInvitations(
  eventId: string,
  requesterId: string,
  dto: SendInvitationsDto,
) {
  await assertPlannerOwns(eventId, requesterId);

  const event = await queryOne<{
    name: string;
    start_time: Date;
    rsvp_deadline: Date;
  }>(`SELECT name, start_time, rsvp_deadline FROM events WHERE id=$1`, [
    eventId,
  ]);
  if (!event) throw new NotFoundError("Event");

  const venue = await queryOne<{ name: string }>(
    `SELECT v.name FROM venues v JOIN events e ON e.venue_id=v.id WHERE e.id=$1`,
    [eventId],
  );

  const results = { sent: 0, failed: 0 };

  for (const guestId of dto.guestIds) {
    try {
      const guest = await queryOne<{ id: string; name: string; email: string }>(
        `SELECT id,name,email FROM guests WHERE id=$1 AND event_id=$2`,
        [guestId, eventId],
      );
      if (!guest?.email) continue;

      const token = generateToken();
      await query(
        `INSERT INTO invitations (event_id,guest_id,token,channel) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [eventId, guestId, token, dto.channel],
      );

      const rsvpUrl = `${env.CLIENT_URL}/invite/${token}`;
      const tmpl = invitationTemplate({
        guestName: guest.name,
        eventName: event.name,
        eventDate: new Date(event.start_time).toLocaleDateString("en-NG", {
          dateStyle: "full",
        }),
        venueName: venue?.name ?? "TBD",
        rsvpUrl,
        rsvpDeadline: event.rsvp_deadline
          ? new Date(event.rsvp_deadline).toLocaleDateString("en-NG", {
              dateStyle: "full",
            })
          : "ASAP",
      });

      await sendEmail({ to: guest.email, ...tmpl });
      await query(`UPDATE invitations SET sent_at=NOW() WHERE token=$1`, [
        token,
      ]);
      results.sent++;
    } catch {
      results.failed++;
    }
  }

  return results;
}

export async function handleRsvp(dto: RsvpRespondDto) {
  const inv = await queryOne<{ id: string; guest_id: string }>(
    `SELECT id, guest_id FROM invitations WHERE token=$1`,
    [dto.token],
  );
  if (!inv) throw new NotFoundError("Invitation");

  await query(
    `UPDATE invitations SET status='responded', responded_at=NOW() WHERE id=$1`,
    [inv.id],
  );
  await query(`UPDATE guests SET rsvp_status=$1 WHERE id=$2`, [
    dto.status,
    inv.guest_id,
  ]);

  if (dto.dietaryReq)
    await query(`UPDATE guests SET dietary_req=$1 WHERE id=$2`, [
      dto.dietaryReq,
      inv.guest_id,
    ]);
  if (dto.accessibilityReq)
    await query(`UPDATE guests SET accessibility_req=$1 WHERE id=$2`, [
      dto.accessibilityReq,
      inv.guest_id,
    ]);
}

export async function sendSeatNotifications(
  eventId: string,
  requesterId: string,
  dto: SendSeatNotificationsDto,
) {
  await assertPlannerOwns(eventId, requesterId);

  const event = await queryOne<{ name: string; start_time: Date }>(
    `SELECT name, start_time FROM events WHERE id=$1`,
    [eventId],
  );
  if (!event) throw new NotFoundError("Event");

  const extraFilter = dto.guestIds?.length ? `AND g.id = ANY($2::uuid[])` : "";
  const params: unknown[] = dto.guestIds?.length
    ? [eventId, dto.guestIds]
    : [eventId];

  const guests = await query<{
    id: string;
    name: string;
    email: string;
    seat_label: string;
    zone_name: string;
    token: string | null;
  }>(
    `SELECT g.id,g.name,g.email,sa.seat_label,sa.zone_name,i.token
     FROM guests g
     JOIN seat_assignments sa ON sa.guest_id=g.id AND sa.event_id=$1
     LEFT JOIN invitations i ON i.guest_id=g.id AND i.event_id=$1
     WHERE g.event_id=$1 AND g.email IS NOT NULL ${extraFilter}`,
    params,
  );

  const results = { sent: 0, failed: 0 };
  for (const guest of guests) {
    try {
      const token = guest.token ?? generateToken();
      const seatFinderUrl = `${env.CLIENT_URL}/seat/${token}`;
      const qrCode = await generateQRCode(seatFinderUrl);
      const tmpl = seatAssignmentTemplate({
        guestName: guest.name,
        eventName: event.name,
        eventDate: new Date(event.start_time).toLocaleDateString("en-NG", {
          dateStyle: "full",
        }),
        seatLabel: guest.seat_label,
        zoneName: guest.zone_name,
        seatFinderUrl,
        qrCodeDataUrl: qrCode,
      });
      await sendEmail({ to: guest.email, ...tmpl });
      results.sent++;
    } catch {
      results.failed++;
    }
  }
  return results;
}

export async function getInvitationStats(eventId: string, requesterId: string) {
  await assertPlannerOwns(eventId, requesterId);
  const [stats] = await query(
    `SELECT
       COUNT(*) FILTER (WHERE status='sent')      AS sent,
       COUNT(*) FILTER (WHERE status='viewed')    AS viewed,
       COUNT(*) FILTER (WHERE status='responded') AS responded,
       COUNT(*) AS total
     FROM invitations WHERE event_id=$1`,
    [eventId],
  );
  return stats;
}
