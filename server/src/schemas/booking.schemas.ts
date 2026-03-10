import { z } from 'zod';

export const createBookingSchema = z.object({
  venueId:             z.string().uuid(),
  eventId:             z.string().uuid(),
  eventDate:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  totalAmount:         z.number().positive(),
  message:             z.string().optional(),
  specialRequirements: z.string().optional(),
});

export const respondBookingSchema = z.object({
  action:        z.enum(['accept','decline','counter_offer']),
  message:       z.string().optional(),
  counterAmount: z.number().positive().optional(),
});

export type CreateBookingDto  = z.infer<typeof createBookingSchema>;
export type RespondBookingDto = z.infer<typeof respondBookingSchema>;
