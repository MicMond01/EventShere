import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as adminService from '../services/admin.service';

export async function getPlatformStats(_req: Request, res: Response): Promise<void> {
  const data = await adminService.getPlatformStats();
  res.json({ success: true, data });
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const data = await adminService.listUsers(req.query as Record<string, string>);
  res.json({ success: true, data });
}

export async function updateUserStatus(req: Request, res: Response): Promise<void> {
  await adminService.updateUserStatus(req.params.id, req.body.status);
  res.json({ success: true });
}

export async function getPendingVenues(_req: Request, res: Response): Promise<void> {
  const data = await adminService.getPendingVenues();
  res.json({ success: true, data });
}

export async function reviewVenue(req: Request, res: Response): Promise<void> {
  await adminService.reviewVenue(req.params.id, req.body.action);
  res.json({ success: true });
}

export async function getFlaggedRatings(_req: Request, res: Response): Promise<void> {
  const data = await adminService.getFlaggedRatings();
  res.json({ success: true, data });
}

export async function deleteRating(req: Request, res: Response): Promise<void> {
  await adminService.deleteRating(req.params.id);
  res.json({ success: true });
}

export async function getEvents(req: Request, res: Response): Promise<void> {
  const data = await adminService.getEvents(req.query as Record<string, string>);
  res.json({ success: true, data });
}

export async function updateEventStatus(req: Request, res: Response): Promise<void> {
  await adminService.updateEventStatus(req.params.id, req.body.status);
  res.json({ success: true });
}

export async function deleteEvent(req: Request, res: Response): Promise<void> {
  await adminService.deleteEvent(req.params.id);
  res.json({ success: true });
}

export async function getBookings(req: Request, res: Response): Promise<void> {
  const data = await adminService.getBookings(req.query as Record<string, string>);
  res.json({ success: true, data });
}

export async function updateBookingStatus(req: Request, res: Response): Promise<void> {
  await adminService.updateBookingStatus(req.params.id, req.body.status);
  res.json({ success: true });
}

export async function deleteBooking(req: Request, res: Response): Promise<void> {
  await adminService.deleteBooking(req.params.id);
  res.json({ success: true });
}

export async function getAllGuests(req: Request, res: Response): Promise<void> {
  const data = await adminService.getAllGuests(req.query as Record<string, string>);
  res.json({ success: true, data });
}
