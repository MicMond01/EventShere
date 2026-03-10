import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as ratingService from '../services/rating.service';

export async function submitRating(req: AuthRequest, res: Response): Promise<void> {
  const data = await ratingService.submitRating(req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function getMyScore(req: AuthRequest, res: Response): Promise<void> {
  const data = await ratingService.getMyScore(req.user.userId);
  res.json({ success: true, data });
}

export async function flagRating(req: Request, res: Response): Promise<void> {
  await ratingService.flagRating(req.params.id);
  res.json({ success: true, message: 'Rating flagged for review' });
}
