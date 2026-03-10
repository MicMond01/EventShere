import crypto from 'crypto';
import QRCode from 'qrcode';

/** Random URL-safe token */
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/** Slugify a string for URLs */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Generate unique event slug */
export function generateSlug(name: string): string {
  const base = slugify(name);
  const suffix = crypto.randomBytes(3).toString('hex'); // e.g. "a3f9b2"
  return `${base}-${suffix}`;
}

/** Generate a QR code data URL */
export async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, { errorCorrectionLevel: 'M', width: 300 });
}

/** Strip undefined keys from an object (for SQL patch updates) */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/** Build a dynamic SET clause for SQL UPDATE */
export function buildSetClause(
  fields: Record<string, unknown>,
  startIndex = 1
): { clause: string; values: unknown[] } {
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  const clause = entries.map(([key, _], i) => `${key} = $${i + startIndex}`).join(', ');
  const values = entries.map(([, v]) => v);
  return { clause, values };
}
