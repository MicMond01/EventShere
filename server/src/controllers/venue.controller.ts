import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as venueService from '../services/venue.service';

export async function createVenue(req: AuthRequest, res: Response): Promise<void> {
  const data = await venueService.createVenue(req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function getVenueById(req: Request, res: Response): Promise<void> {
  const data = await venueService.getVenueById(req.params.id);
  res.json({ success: true, data });
}

export async function updateVenue(req: AuthRequest, res: Response): Promise<void> {
  const data = await venueService.updateVenue(req.params.id, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function deleteVenue(req: AuthRequest, res: Response): Promise<void> {
  await venueService.deleteVenue(req.params.id, req.user.userId, req.user.role);
  res.json({ success: true });
}

export async function searchVenues(req: Request, res: Response): Promise<void> {
  const data = await venueService.searchVenues(req.query as Record<string, string>);
  res.json({ success: true, data });
}

export async function getMyVenues(req: AuthRequest, res: Response): Promise<void> {
  const data = await venueService.getMyVenues(req.user.userId);
  res.json({ success: true, data });
}

export async function addMedia(req: AuthRequest, res: Response): Promise<void> {
  const data = await venueService.addMedia(req.params.id, req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function deleteMedia(req: AuthRequest, res: Response): Promise<void> {
  await venueService.deleteMedia(req.params.mediaId, req.user.userId);
  res.json({ success: true });
}

export async function getAvailability(req: Request, res: Response): Promise<void> {
  const data = await venueService.getAvailability(req.params.id, req.query.month as string);
  res.json({ success: true, data });
}

export async function setAvailability(req: AuthRequest, res: Response): Promise<void> {
  await venueService.setAvailability(req.params.id, req.user.userId, req.body);
  res.json({ success: true });
}

export async function getReviews(req: Request, res: Response): Promise<void> {
  const data = await venueService.getReviews(req.params.id);
  res.json({ success: true, data });
}

export async function addReview(req: AuthRequest, res: Response): Promise<void> {
  const data = await venueService.addReview(req.params.id, req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}
