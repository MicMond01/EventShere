import { Response } from 'express';
import { AuthRequest } from '../types';
import * as bookingService from '../services/booking.service';

export async function createBooking(req: AuthRequest, res: Response): Promise<void> {
  const data = await bookingService.createBooking(req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function respondToBooking(req: AuthRequest, res: Response): Promise<void> {
  const data = await bookingService.respondToBooking(req.params.id, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function confirmBooking(req: AuthRequest, res: Response): Promise<void> {
  const data = await bookingService.confirmBooking(req.params.id, req.user.userId);
  res.json({ success: true, data });
}

export async function getMyBookings(req: AuthRequest, res: Response): Promise<void> {
  const data = await bookingService.getMyBookings(req.user.userId, req.user.role);
  res.json({ success: true, data });
}

export async function getBookingById(req: AuthRequest, res: Response): Promise<void> {
  const data = await bookingService.getBookingById(req.params.id, req.user.userId);
  res.json({ success: true, data });
}
