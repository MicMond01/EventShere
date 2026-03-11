import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  photoUrl: z.string().url().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema>;
