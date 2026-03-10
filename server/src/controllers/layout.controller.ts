import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as layoutService from '../services/layout.service';

export async function getLayouts(req: AuthRequest, res: Response): Promise<void> {
  const data = await layoutService.getLayouts(req.params.eventId, req.user.userId);
  res.json({ success: true, data });
}

export async function getActiveLayout(req: Request, res: Response): Promise<void> {
  const data = await layoutService.getActiveLayout(req.params.eventId);
  res.json({ success: true, data });
}

export async function getLayoutById(req: AuthRequest, res: Response): Promise<void> {
  const data = await layoutService.getLayoutById(req.params.eventId, req.params.layoutId, req.user.userId);
  res.json({ success: true, data });
}

export async function saveLayout(req: AuthRequest, res: Response): Promise<void> {
  const data = await layoutService.saveLayout(req.params.eventId, req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function activateLayout(req: AuthRequest, res: Response): Promise<void> {
  const data = await layoutService.activateLayout(req.params.eventId, req.params.layoutId, req.user.userId);
  res.json({ success: true, data });
}

export async function deleteLayout(req: AuthRequest, res: Response): Promise<void> {
  await layoutService.deleteLayout(req.params.eventId, req.params.layoutId, req.user.userId);
  res.json({ success: true });
}

export async function getSeats(req: Request, res: Response): Promise<void> {
  const data = await layoutService.getSeats(req.params.eventId);
  res.json({ success: true, data });
}
