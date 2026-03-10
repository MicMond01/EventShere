import { z } from 'zod';

export const addGuestSchema = z.object({
  name:            z.string().min(2).max(200),
  email:           z.string().email().optional(),
  phone:           z.string().max(20).optional(),
  category:        z.enum(['vip','dignitary','family','general','press','vendor_staff']).default('general'),
  notes:           z.string().optional(),
  dietaryReq:      z.string().optional(),
  accessibilityReq:z.string().optional(),
});

export const bulkAddGuestsSchema = z.object({
  guests: z.array(addGuestSchema).min(1).max(1000),
});

export const updateGuestSchema = addGuestSchema.partial().extend({
  rsvpStatus: z.enum(['pending','confirmed','declined','tentative','waitlisted']).optional(),
  seatId:     z.string().optional(),
});

export const checkInSchema = z.object({
  qrCode:    z.string().optional(),
  guestId:   z.string().uuid().optional(),
  seatLabel: z.string().optional(),
});

export type AddGuestDto    = z.infer<typeof addGuestSchema>;
export type UpdateGuestDto = z.infer<typeof updateGuestSchema>;
export type CheckInDto     = z.infer<typeof checkInSchema>;
