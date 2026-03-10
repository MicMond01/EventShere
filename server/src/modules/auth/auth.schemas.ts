import { z } from 'zod';

export const registerSchema = z.object({
  email:       z.string().email(),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).max(100),
  role:        z.enum(['venue_owner', 'planner', 'guest', 'vendor']),
  phone:       z.string().optional(),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8),
});

export type RegisterDto        = z.infer<typeof registerSchema>;
export type LoginDto           = z.infer<typeof loginSchema>;
export type ForgotPasswordDto  = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto   = z.infer<typeof resetPasswordSchema>;
