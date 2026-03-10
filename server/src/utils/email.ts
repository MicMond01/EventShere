import sgMail from "@sendgrid/mail";
import { env } from "../config/env";

sgMail.setApiKey(env.SENDGRID_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: EmailOptions): Promise<void> {
  if (env.NODE_ENV === "development" && !env.SENDGRID_API_KEY) {
    console.log(`\n📧 [DEV EMAIL]\nTo: ${opts.to}\nSubject: ${opts.subject}\n`);
    return;
  }
  await sgMail.send({ from: env.EMAIL_FROM, ...opts });
}

export function invitationTemplate(p: {
  guestName: string;
  eventName: string;
  eventDate: string;
  venueName: string;
  rsvpUrl: string;
  rsvpDeadline: string;
}) {
  return {
    subject: `You're invited to ${p.eventName}`,
    html: `<h2>Hello ${p.guestName},</h2>
           <p>You are invited to <strong>${p.eventName}</strong> on <strong>${p.eventDate}</strong> at <strong>${p.venueName}</strong>.</p>
           <p>Please RSVP before <strong>${p.rsvpDeadline}</strong>.</p>
           <a href="${p.rsvpUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">RSVP Now</a>`,
    text: `You're invited to ${p.eventName} on ${p.eventDate} at ${p.venueName}. RSVP: ${p.rsvpUrl}`,
  };
}

export function seatAssignmentTemplate(p: {
  guestName: string;
  eventName: string;
  eventDate: string;
  seatLabel: string;
  zoneName: string;
  seatFinderUrl: string;
  qrCodeDataUrl: string;
}) {
  return {
    subject: `Your seat for ${p.eventName} — ${p.seatLabel}`,
    html: `<h2>Hello ${p.guestName},</h2>
           <p>Your seat for <strong>${p.eventName}</strong> is <strong>${p.seatLabel}</strong> in ${p.zoneName}.</p>
           <p><a href="${p.seatFinderUrl}">View your seat on the 3D map →</a></p>
           <p>Show this QR code at check-in:</p>
           <img src="${p.qrCodeDataUrl}" width="200" alt="Check-in QR" />`,
    text: `Your seat for ${p.eventName}: ${p.seatLabel} (${p.zoneName}). Map: ${p.seatFinderUrl}`,
  };
}

export function bookingConfirmationTemplate(p: {
  plannerName: string;
  venueName: string;
  eventDate: string;
  totalAmount: string;
  currency: string;
}) {
  return {
    subject: `Booking Confirmed — ${p.venueName}`,
    html: `<h2>Booking Confirmed!</h2>
           <p>Hello ${p.plannerName}, your booking for <strong>${p.venueName}</strong> on <strong>${p.eventDate}</strong> is confirmed.</p>
           <p>Amount paid: <strong>${p.currency} ${p.totalAmount}</strong></p>`,
    text: `Booking confirmed for ${p.venueName} on ${p.eventDate}. Amount: ${p.currency} ${p.totalAmount}`,
  };
}

export function passwordResetTemplate(p: { resetUrl: string }) {
  return {
    subject: "Reset your EventShere password",
    html: `<h2>Password Reset Request</h2>
           <p>We received a request to reset your password. Click the link below to set a new one:</p>
           <p><a href="${p.resetUrl}" style="background:#ef4444;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
           <p>If you didn't request this, you can safely ignore this email.</p>`,
    text: `Reset your EventShere password by visiting this link: ${p.resetUrl}`,
  };
}
