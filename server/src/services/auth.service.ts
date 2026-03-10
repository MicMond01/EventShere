import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, queryOne, withTransaction } from '../db/postgres/client';
import { env } from '../config/env';
import { DEFAULT_SOCIAL_SCORE } from '@eventshere/shared';
import { ConflictError, UnauthorizedError, NotFoundError } from '../middleware/errorHandler';
import { RegisterDto, LoginDto } from '../schemas/auth.schemas';

interface TokenPair { accessToken: string; refreshToken: string; }

function signAccess(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, env.JWT.ACCESS_SECRET, { expiresIn: env.JWT.ACCESS_EXPIRES_IN } as any);
}

function signRefresh(): string {
  return crypto.randomBytes(64).toString('hex');
}

async function saveRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
}

// ── Public service functions ───────────────────────────────

export async function register(dto: RegisterDto): Promise<TokenPair> {
  const existing = await queryOne(`SELECT id FROM users WHERE email = $1`, [dto.email]);
  if (existing) throw new ConflictError('An account with this email already exists');

  const hashed = await bcrypt.hash(dto.password, 12);

  const user = await withTransaction(async (client) => {
    const { rows: [newUser] } = await client.query(
      `INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *`,
      [dto.email.toLowerCase(), hashed, dto.role]
    );
    await client.query(
      `INSERT INTO user_profiles (user_id, display_name) VALUES ($1, $2)`,
      [newUser.id, dto.displayName]
    );
    await client.query(
      `INSERT INTO social_scores (user_id, current_score, tier) VALUES ($1, $2, 'standard')`,
      [newUser.id, DEFAULT_SOCIAL_SCORE]
    );
    return newUser;
  });

  const accessToken  = signAccess({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefresh();
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
}

export async function login(dto: LoginDto): Promise<TokenPair> {
  const user = await queryOne<{ id: string; email: string; password: string; role: string; status: string }>(
    `SELECT id, email, password, role, status FROM users WHERE email = $1`,
    [dto.email.toLowerCase()]
  );
  if (!user) throw new UnauthorizedError('Invalid email or password');
  if (user.status !== 'active') throw new UnauthorizedError('Your account has been suspended');

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  const accessToken  = signAccess({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefresh();
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
}

export async function refreshTokens(oldToken: string): Promise<TokenPair> {
  const stored = await queryOne<{ id: string; user_id: string; expires_at: Date; is_revoked: boolean }>(
    `SELECT id, user_id, expires_at, is_revoked FROM refresh_tokens WHERE token = $1`,
    [oldToken]
  );
  if (!stored || stored.is_revoked || new Date() > new Date(stored.expires_at)) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Rotation — revoke the old one
  await query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = $1`, [stored.id]);

  const user = await queryOne<{ id: string; email: string; role: string }>(
    `SELECT id, email, role FROM users WHERE id = $1`, [stored.user_id]
  );
  if (!user) throw new UnauthorizedError('User no longer exists');

  const accessToken  = signAccess({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefresh();
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
}

export async function logout(refreshToken: string): Promise<void> {
  await query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1`, [refreshToken]);
}

export async function getMe(userId: string) {
  const user = await queryOne(
    `SELECT u.id, u.email, u.role, u.status, u.created_at,
            p.display_name, p.photo_url, p.bio, p.phone,
            ss.current_score, ss.tier
     FROM users u
     JOIN user_profiles p  ON p.user_id = u.id
     LEFT JOIN social_scores ss ON ss.user_id = u.id
     WHERE u.id = $1`,
    [userId]
  );
  if (!user) throw new NotFoundError('User');
  return user;
}
