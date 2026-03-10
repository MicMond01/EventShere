import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: EmailOptions): Promise<void> {
  if (process.env.NODE_ENV === 'development' && !process.env.SENDGRID_API_KEY) {
    console.log(`\n📧 [DEV EMAIL] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text || ''}\n`);
    return;
  }
  await sgMail.send({
    to: opts.to,
    from: process.env.EMAIL_FROM || 'noreply@eventshere.com',
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

// ── Email templates ────────────────────────────────────────

export function welcomeEmail(displayName: string): Pick<EmailOptions, 'subject' | 'html' | 'text'> {
  return {
    subject: 'Welcome to EventShere 🎉',
    html: `<h2>Welcome, ${displayName}!</h2><p>Your EventShere account is ready. Start planning or discovering events today.</p>`,
    text: `Welcome, ${displayName}! Your EventShere account is ready.`,
  };
}

export function invitationEmail(opts: {
  guestName: string;
  eventName: string;
  eventDate: string;
  venueName: string;
  rsvpUrl: string;
  rsvpDeadline: string;
}): Pick<EmailOptions, 'subject' | 'html' | 'text'> {
  return {
    subject: `You're invited to ${opts.eventName}`,
    html: `
      <h2>Hello ${opts.guestName},</h2>
      <p>You have been invited to <strong>${opts.eventName}</strong>.</p>
      <p><strong>Date:</strong> ${opts.eventDate}</p>
      <p><strong>Venue:</strong> ${opts.venueName}</p>
      <p>Please RSVP before <strong>${opts.rsvpDeadline}</strong>.</p>
      <a href="${opts.rsvpUrl}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">RSVP Now</a>
    `,
    text: `You're invited to ${opts.eventName} on ${opts.eventDate} at ${opts.venueName}. RSVP at: ${opts.rsvpUrl}`,
  };
}

export function seatAssignmentEmail(opts: {
  guestName: string;
  eventName: string;
  eventDate: string;
  seatLabel: string;
  zoneName: string;
  seatFinderUrl: string;
  qrCodeDataUrl: string;
}): Pick<EmailOptions, 'subject' | 'html' | 'text'> {
  return {
    subject: `Your seat for ${opts.eventName} — ${opts.seatLabel}`,
    html: `
      <h2>Hello ${opts.guestName},</h2>
      <p>Your seat for <strong>${opts.eventName}</strong> has been assigned.</p>
      <p><strong>Seat:</strong> ${opts.seatLabel} (${opts.zoneName})</p>
      <p><strong>Date:</strong> ${opts.eventDate}</p>
      <p>Use the link below to view your seat on the interactive 3D map:</p>
      <a href="${opts.seatFinderUrl}">View My Seat →</a>
      <p>Present the QR code below at the entrance for check-in:</p>
      <img src="${opts.qrCodeDataUrl}" alt="Your check-in QR code" width="200" />
    `,
    text: `Your seat for ${opts.eventName}: ${opts.seatLabel} (${opts.zoneName}). View: ${opts.seatFinderUrl}`,
  };
}

export function bookingConfirmationEmail(opts: {
  plannerName: string;
  venueName: string;
  eventDate: string;
  totalAmount: string;
  currency: string;
}): Pick<EmailOptions, 'subject' | 'html' | 'text'> {
  return {
    subject: `Booking Confirmed — ${opts.venueName}`,
    html: `
      <h2>Booking Confirmed!</h2>
      <p>Hello ${opts.plannerName}, your booking for <strong>${opts.venueName}</strong> has been confirmed.</p>
      <p><strong>Event Date:</strong> ${opts.eventDate}</p>
      <p><strong>Amount Paid:</strong> ${opts.currency} ${opts.totalAmount}</p>
    `,
    text: `Booking confirmed for ${opts.venueName} on ${opts.eventDate}. Amount: ${opts.currency} ${opts.totalAmount}`,
  };
}
