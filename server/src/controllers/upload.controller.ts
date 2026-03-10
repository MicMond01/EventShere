import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as uploadService from '../services/upload.service';

export async function uploadImage(req: Request, res: Response): Promise<void> {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const folder = (req.query.folder as string) || 'general';
  const data = await uploadService.uploadToCloudinary(req.file.buffer, folder, 'image');
  res.json({ success: true, data });
}

export async function uploadImages(req: Request, res: Response): Promise<void> {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) throw new AppError('No files uploaded', 400);
  const folder = (req.query.folder as string) || 'general';
  const data = await uploadService.uploadMany(files, folder);
  res.json({ success: true, data });
}

export async function uploadVideo(req: Request, res: Response): Promise<void> {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const data = await uploadService.uploadToCloudinary(req.file.buffer, 'videos', 'video');
  res.json({ success: true, data });
}

export async function uploadModel(req: Request, res: Response): Promise<void> {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const data = await uploadService.uploadToCloudinary(req.file.buffer, 'models', 'raw');
  res.json({ success: true, data });
}
