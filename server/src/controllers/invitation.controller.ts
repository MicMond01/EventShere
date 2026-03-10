import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as invitationService from '../services/invitation.service';

export async function sendInvitations(req: AuthRequest, res: Response): Promise<void> {
  const data = await invitationService.sendInvitations(req.params.eventId, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function handleRsvp(req: Request, res: Response): Promise<void> {
  await invitationService.handleRsvp(req.body);
  res.json({ success: true, message: `RSVP recorded as ${req.body.status}` });
}

export async function sendSeatNotifications(req: AuthRequest, res: Response): Promise<void> {
  const data = await invitationService.sendSeatNotifications(req.params.eventId, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function getInvitationStats(req: AuthRequest, res: Response): Promise<void> {
  const data = await invitationService.getInvitationStats(req.params.eventId, req.user.userId);
  res.json({ success: true, data });
}
