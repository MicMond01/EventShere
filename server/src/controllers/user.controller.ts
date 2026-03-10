import { Response } from 'express';
import { AuthRequest } from '../types';
import * as userService from '../services/user.service';

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const data = await userService.getProfile(req.user.userId);
  res.json({ success: true, data });
}

export async function updateMe(req: AuthRequest, res: Response): Promise<void> {
  const data = await userService.updateProfile(req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function getPublicProfile(req: AuthRequest, res: Response): Promise<void> {
  const data = await userService.getPublicProfile(req.params.id);
  res.json({ success: true, data });
}

export async function getMyScoreHistory(req: AuthRequest, res: Response): Promise<void> {
  const data = await userService.getScoreHistory(req.user.userId);
  res.json({ success: true, data });
}
