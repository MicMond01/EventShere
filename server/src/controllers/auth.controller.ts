import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as authService from '../services/auth.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken } = await authService.register(req.body);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.status(201).json({ success: true, data: { accessToken } });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken } = await authService.login(req.body);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.json({ success: true, data: { accessToken } });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) {
    res.status(401).json({ success: false, message: 'No refresh token provided' });
    return;
  }
  const { accessToken, refreshToken } = await authService.refreshTokens(token);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.json({ success: true, data: { accessToken } });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken as string | undefined;
  if (token) await authService.logout(token);
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const data = await authService.getMe(req.user.userId);
  res.json({ success: true, data });
}
