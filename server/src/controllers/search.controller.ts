import { Request, Response } from 'express';
import * as searchService from '../services/search.service';

export async function search(req: Request, res: Response): Promise<void> {
  const q    = (req.query.q as string) || '';
  const type = (req.query.type as string) || 'all';
  const data = await searchService.search(q, type);
  res.json({ success: true, data });
}
