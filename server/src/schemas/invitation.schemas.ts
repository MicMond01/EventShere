import { z } from 'zod';

export const sendInvitationsSchema = z.object({
  guestIds: z.array(z.string().uuid()).min(1),
  channel:  z.enum(['email','sms','whatsapp','in_app']).default('email'),
});

export const rsvpRespondSchema = z.object({
  token:            z.string().min(1),
  status:           z.enum(['confirmed','declined','tentative']),
  dietaryReq:       z.string().optional(),
  accessibilityReq: z.string().optional(),
});

export const sendSeatNotificationsSchema = z.object({
  guestIds: z.array(z.string().uuid()).optional(),
});

export type SendInvitationsDto      = z.infer<typeof sendInvitationsSchema>;
export type RsvpRespondDto          = z.infer<typeof rsvpRespondSchema>;
export type SendSeatNotificationsDto= z.infer<typeof sendSeatNotificationsSchema>;
