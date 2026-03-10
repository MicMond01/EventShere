import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as guestService from '../services/guest.service';

export async function addGuest(req: AuthRequest, res: Response): Promise<void> {
  const data = await guestService.addGuest(req.params.eventId, req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function bulkAddGuests(req: AuthRequest, res: Response): Promise<void> {
  const data = await guestService.bulkAddGuests(req.params.eventId, req.user.userId, req.body.guests);
  res.status(201).json({ success: true, data });
}

export async function getGuests(req: AuthRequest, res: Response): Promise<void> {
  const data = await guestService.getGuests(req.params.eventId, req.user.userId, req.query as Record<string, string>);
  res.json({ success: true, data });
}

export async function updateGuest(req: AuthRequest, res: Response): Promise<void> {
  const data = await guestService.updateGuest(req.params.guestId, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function removeGuest(req: AuthRequest, res: Response): Promise<void> {
  await guestService.removeGuest(req.params.guestId, req.user.userId);
  res.json({ success: true });
}

export async function checkInGuest(req: AuthRequest, res: Response): Promise<void> {
  const data = await guestService.checkInGuest(req.params.eventId, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function getCheckinStats(req: AuthRequest, res: Response): Promise<void> {
  const data = await guestService.getCheckinStats(req.params.eventId, req.user.userId);
  res.json({ success: true, data });
}

export async function getGuestByToken(req: Request, res: Response): Promise<void> {
  const data = await guestService.getGuestByToken(req.params.token);
  res.json({ success: true, data });
}
