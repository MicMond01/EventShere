import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../../db/postgres/client';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../middleware/errorHandler';
import { RegisterDto, LoginDto } from './auth.schemas';
import { JwtPayload } from '../../middleware/auth.middleware';

// ── Token helpers ──────────────────────────────────────────

function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
}

function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

// ── Service methods ────────────────────────────────────────

export async function register(dto: RegisterDto) {
  // Check duplicate email
  const existing = await queryOne('SELECT id FROM users WHERE email = $1', [dto.email]);
  if (existing) throw new ConflictError('An account with this email already exists');

  const passwordHash = await bcrypt.hash(dto.password, 12);

  // Insert user
  const [user] = await query<{ id: string; email: string; role: string }>(
    `INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role`,
    [dto.email, passwordHash, dto.role]
  );

  // Insert profile
  await query(
    `INSERT INTO user_profiles (user_id, display_name, phone) VALUES ($1, $2, $3)`,
    [user.id, dto.displayName, dto.phone ?? null]
  );

  // Create social score record
  await query(
    `INSERT INTO social_scores (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
    [user.id]
  );

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role as any };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Persist refresh token
  await storeRefreshToken(user.id, refreshToken);

  return { user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken };
}

export async function login(dto: LoginDto) {
  const user = await queryOne<{ id: string; email: string; password: string; role: string; status: string }>(
    `SELECT id, email, password, role, status FROM users WHERE email = $1`,
    [dto.email]
  );

  if (!user) throw new UnauthorizedError('Invalid email or password');
  if (user.status === 'suspended') throw new UnauthorizedError('Account suspended');
  if (user.status === 'banned') throw new UnauthorizedError('Account banned');

  const isMatch = await bcrypt.compare(dto.password, user.password);
  if (!isMatch) throw new UnauthorizedError('Invalid email or password');

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role as any };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await storeRefreshToken(user.id, refreshToken);

  return { user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken };
}

export async function refreshTokens(oldRefreshToken: string) {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Check it exists and isn't revoked
  const stored = await queryOne<{ id: string; is_revoked: boolean }>(
    `SELECT id, is_revoked FROM refresh_tokens WHERE token = $1`,
    [oldRefreshToken]
  );
  if (!stored || stored.is_revoked) throw new UnauthorizedError('Refresh token revoked');

  // Rotate: revoke old, issue new
  await query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1`, [oldRefreshToken]);

  const newAccessToken  = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);
  await storeRefreshToken(payload.userId, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string) {
  await query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1`, [refreshToken]);
}

export async function revokeAllSessions(userId: string) {
  await query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1`, [userId]);
}

// ── Private helpers ────────────────────────────────────────

async function storeRefreshToken(userId: string, token: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
}
