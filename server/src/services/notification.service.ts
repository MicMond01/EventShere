import { query, queryOne } from '../db/postgres/client';
import { paginate } from '../utils/helpers';

export async function getNotifications(userId: string, params: Record<string, string>) {
  const { page, limit, offset } = paginate(Number(params.page), Number(params.limit));
  const rows = await query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  const [{ count }] = await query<any>(`SELECT COUNT(*) FROM notifications WHERE user_id = $1`, [userId]);
  return { data: rows, total: Number(count), page, limit };
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [{ count }] = await query<any>(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL`, [userId]
  );
  return Number(count);
}

export async function markRead(notificationId: string, userId: string): Promise<void> {
  await query(
    `UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2`, [notificationId, userId]
  );
}

export async function markAllRead(userId: string): Promise<void> {
  await query(`UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL`, [userId]);
}

// Helper called by other services to create a notification
export async function createNotification(p: {
  userId: string; type: string; title: string; body: string;
  data?: Record<string, unknown>; channel?: string;
}): Promise<void> {
  await query(
    `INSERT INTO notifications (user_id,type,title,body,data,channel) VALUES ($1,$2,$3,$4,$5,$6)`,
    [p.userId, p.type, p.title, p.body, JSON.stringify(p.data ?? {}), p.channel ?? 'in_app']
  );
}
