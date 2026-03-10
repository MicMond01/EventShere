import { query, queryOne } from '../db/postgres/client';
import { NotFoundError } from '../middleware/errorHandler';
import { buildSetClause } from '../utils/helpers';
import { UpdateProfileDto } from '../schemas/user.schemas';

export async function getProfile(userId: string) {
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

export async function updateProfile(userId: string, dto: UpdateProfileDto) {
  const fields: Record<string, unknown> = {};
  if (dto.displayName !== undefined) fields.display_name = dto.displayName;
  if (dto.bio         !== undefined) fields.bio          = dto.bio;
  if (dto.phone       !== undefined) fields.phone        = dto.phone;
  if (dto.photoUrl    !== undefined) fields.photo_url    = dto.photoUrl;
  fields.updated_at = new Date();

  const { clause, values } = buildSetClause(fields);
  await query(
    `UPDATE user_profiles SET ${clause} WHERE user_id = $${values.length + 1}`,
    [...values, userId]
  );
  return getProfile(userId);
}

export async function getPublicProfile(userId: string) {
  const user = await queryOne(
    `SELECT u.id, u.role, p.display_name, p.photo_url, p.bio,
            ss.current_score, ss.tier
     FROM users u
     JOIN user_profiles p  ON p.user_id = u.id
     LEFT JOIN social_scores ss ON ss.user_id = u.id
     WHERE u.id = $1 AND u.status = 'active'`,
    [userId]
  );
  if (!user) throw new NotFoundError('User');
  return user;
}

export async function getScoreHistory(userId: string) {
  const row = await queryOne<{ score_history: unknown[] }>(
    `SELECT score_history FROM social_scores WHERE user_id = $1`, [userId]
  );
  return row?.score_history ?? [];
}
