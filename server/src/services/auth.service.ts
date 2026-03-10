import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { query, queryOne, withTransaction } from "../db/postgres/client";
import { env } from "../config/env";
import {
  DEFAULT_SOCIAL_SCORE,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MINUTES,
} from "@eventshere/shared";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  AppError,
} from "../middleware/errorHandler";
import { RegisterDto, LoginDto } from "../schemas/auth.schemas";
import { sendEmail, passwordResetTemplate } from "../utils/email";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function signAccess(payload: {
  userId: string;
  email: string;
  role: string;
}): string {
  return jwt.sign(payload, env.JWT.ACCESS_SECRET, {
    expiresIn: env.JWT.ACCESS_EXPIRES_IN,
  } as any);
}

function signRefresh(): string {
  return crypto.randomBytes(64).toString("hex");
}

async function saveRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt],
  );
}

// ── Public service functions ───────────────────────────────

export async function register(dto: RegisterDto): Promise<TokenPair> {
  const existing = await queryOne(`SELECT id FROM users WHERE email = $1`, [
    dto.email,
  ]);
  if (existing)
    throw new ConflictError("An account with this email already exists");

  const hashed = await bcrypt.hash(dto.password, 12);

  const user = await withTransaction(async (client) => {
    const {
      rows: [newUser],
    } = await client.query(
      `INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *`,
      [dto.email.toLowerCase(), hashed, dto.role],
    );
    await client.query(
      `INSERT INTO user_profiles (user_id, display_name) VALUES ($1, $2)`,
      [newUser.id, dto.displayName],
    );
    await client.query(
      `INSERT INTO social_scores (user_id, current_score, tier) VALUES ($1, $2, 'standard')`,
      [newUser.id, DEFAULT_SOCIAL_SCORE],
    );
    return newUser;
  });

  const accessToken = signAccess({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefresh();
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
}

export async function login(dto: LoginDto): Promise<TokenPair> {
  const user = await queryOne<{
    id: string;
    email: string;
    password: string;
    role: string;
    status: string;
    failed_login_attempts: number;
    locked_until: Date | null;
  }>(
    `SELECT id, email, password, role, status, failed_login_attempts, locked_until
     FROM users WHERE email = $1`,
    [dto.email.toLowerCase()],
  );

  if (!user) throw new UnauthorizedError("Invalid email or password");
  if (user.status !== "active")
    throw new UnauthorizedError("Your account has been suspended");

  // ── Account lockout check ─────────────────────────────────────────────
  if (user.locked_until && new Date() < new Date(user.locked_until)) {
    const minutesLeft = Math.ceil(
      (new Date(user.locked_until).getTime() - Date.now()) / 60_000,
    );
    throw new AppError(
      `Account is temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      423,
    );
  }

  const valid = await bcrypt.compare(dto.password, user.password);

  if (!valid) {
    const newAttempts = (user.failed_login_attempts ?? 0) + 1;

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockedUntil = new Date(
        Date.now() + LOCKOUT_DURATION_MINUTES * 60_000,
      );
      await query(
        `UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3`,
        [newAttempts, lockedUntil, user.id],
      );
      throw new AppError(
        `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
        423,
      );
    }

    await query(`UPDATE users SET failed_login_attempts = $1 WHERE id = $2`, [
      newAttempts,
      user.id,
    ]);
    throw new UnauthorizedError("Invalid email or password");
  }

  // ── Successful login — clear lockout ──────────────────────────────────
  if (user.failed_login_attempts > 0 || user.locked_until) {
    await query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
      [user.id],
    );
  }

  const accessToken = signAccess({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefresh();
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
}

export async function refreshTokens(oldToken: string): Promise<TokenPair> {
  const stored = await queryOne<{
    id: string;
    user_id: string;
    expires_at: Date;
    is_revoked: boolean;
  }>(
    `SELECT id, user_id, expires_at, is_revoked FROM refresh_tokens WHERE token = $1`,
    [oldToken],
  );
  if (
    !stored ||
    stored.is_revoked ||
    new Date() > new Date(stored.expires_at)
  ) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  // Rotation — revoke the old one
  await query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = $1`, [
    stored.id,
  ]);

  const user = await queryOne<{ id: string; email: string; role: string }>(
    `SELECT id, email, role FROM users WHERE id = $1`,
    [stored.user_id],
  );
  if (!user) throw new UnauthorizedError("User no longer exists");

  const accessToken = signAccess({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefresh();
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
}

export async function logout(refreshToken: string): Promise<void> {
  await query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1`, [
    refreshToken,
  ]);
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
    [userId],
  );
  if (!user) throw new NotFoundError("User");
  return user;
}

// ── Forgot / Reset Password ────────────────────────────────

export async function forgotPassword(email: string): Promise<void> {
  const user = await queryOne<{ id: string; email: string }>(
    `SELECT id, email FROM users WHERE email = $1`,
    [email.toLowerCase()],
  );
  // Always respond 200 even if user doesn't exist (prevents email enumeration)
  if (!user) return;

  // Invalidate all previous tokens for this user
  await query(
    `UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE`,
    [user.id],
  );

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [user.id, token, expiresAt],
  );

  const resetUrl = `${env.CLIENT_URL}/auth/reset-password?token=${token}`;
  const tmpl = passwordResetTemplate({ resetUrl });

  await sendEmail({ to: user.email, ...tmpl });
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const record = await queryOne<{
    id: string;
    user_id: string;
    used: boolean;
    expires_at: Date;
  }>(
    `SELECT id, user_id, used, expires_at FROM password_reset_tokens WHERE token = $1`,
    [token],
  );

  if (!record || record.used || new Date() > new Date(record.expires_at)) {
    throw new AppError("Reset token is invalid or has expired", 400);
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await withTransaction(async (client) => {
    // Update password
    await client.query(
      `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
      [hashed, record.user_id],
    );
    // Mark token as used
    await client.query(
      `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`,
      [record.id],
    );
    // Revoke all refresh tokens — force re-login on all devices
    await client.query(
      `UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1`,
      [record.user_id],
    );
    // Clear any lockout
    await client.query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
      [record.user_id],
    );
  });
}
