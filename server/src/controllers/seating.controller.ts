import { Response } from 'express';
import { AuthRequest } from '../types';
import * as seatingService from '../services/seating.service';

export async function runSeating(req: AuthRequest, res: Response): Promise<void> {
  const data = await seatingService.runSeating(req.params.eventId, req.user.userId);
  res.json({ success: true, data });
}
