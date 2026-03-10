import { Response } from 'express';
import { AuthRequest } from '../types';
import * as notificationService from '../services/notification.service';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  const data = await notificationService.getNotifications(req.user.userId, req.query as Record<string, string>);
  res.json({ success: true, data });
}

export async function getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
  const count = await notificationService.getUnreadCount(req.user.userId);
  res.json({ success: true, data: { count } });
}

export async function markRead(req: AuthRequest, res: Response): Promise<void> {
  await notificationService.markRead(req.params.id, req.user.userId);
  res.json({ success: true });
}

export async function markAllRead(req: AuthRequest, res: Response): Promise<void> {
  await notificationService.markAllRead(req.user.userId);
  res.json({ success: true });
}
