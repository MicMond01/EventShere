import { z } from 'zod';

export const initPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  email:     z.string().email(),
});

export type InitPaymentDto = z.infer<typeof initPaymentSchema>;
