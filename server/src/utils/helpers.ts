import crypto from 'crypto';
import { PaginatedResult } from '../types';

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function generateSlug(name: string): string {
  return `${slugify(name)}-${crypto.randomBytes(3).toString('hex')}`;
}

export function paginate(page = 1, limit = 20) {
  const safePage  = Math.max(1, Number(page)  || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  return { page: safePage, limit: safeLimit, offset: (safePage - 1) * safeLimit };
}

export function paginatedResult<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/** Build a dynamic SET clause for SQL UPDATE — returns { clause, values } */
export function buildSetClause(fields: Record<string, unknown>, startAt = 1) {
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  const clause  = entries.map(([key], i) => `${key} = $${i + startAt}`).join(', ');
  const values  = entries.map(([, v]) => v);
  return { clause, values };
}
