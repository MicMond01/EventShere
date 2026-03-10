import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as eventService from '../services/event.service';

export async function createEvent(req: AuthRequest, res: Response): Promise<void> {
  const data = await eventService.createEvent(req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function getEventById(req: AuthRequest, res: Response): Promise<void> {
  const data = await eventService.getEventById(req.params.id, req.user?.userId);
  res.json({ success: true, data });
}

export async function getEventBySlug(req: Request, res: Response): Promise<void> {
  const data = await eventService.getEventBySlug(req.params.slug);
  res.json({ success: true, data });
}

export async function updateEvent(req: AuthRequest, res: Response): Promise<void> {
  const data = await eventService.updateEvent(req.params.id, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function deleteEvent(req: AuthRequest, res: Response): Promise<void> {
  await eventService.deleteEvent(req.params.id, req.user.userId);
  res.json({ success: true });
}

export async function getMyEvents(req: AuthRequest, res: Response): Promise<void> {
  const data = await eventService.getMyEvents(req.user.userId);
  res.json({ success: true, data });
}

export async function getPublicEvents(req: Request, res: Response): Promise<void> {
  const data = await eventService.getPublicEvents(req.query as Record<string, string>);
  res.json({ success: true, data });
}

export async function addCoPlanner(req: AuthRequest, res: Response): Promise<void> {
  await eventService.addCoPlanner(req.params.id, req.user.userId, req.body);
  res.json({ success: true });
}

export async function removeCoPlanner(req: AuthRequest, res: Response): Promise<void> {
  await eventService.removeCoPlanner(req.params.id, req.user.userId, req.params.userId);
  res.json({ success: true });
}

export async function addRunsheetItem(req: AuthRequest, res: Response): Promise<void> {
  const data = await eventService.addRunsheetItem(req.params.id, req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function toggleRunsheetItem(req: AuthRequest, res: Response): Promise<void> {
  const data = await eventService.toggleRunsheetItem(req.params.itemId, req.user.userId);
  res.json({ success: true, data });
}
