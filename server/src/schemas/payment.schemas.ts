import { z } from 'zod';

export const initPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  email:     z.string().email(),
});

export const confirmPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  paymentId: z.string().uuid(),
});

export type ConfirmPaymentDto = z.infer<typeof confirmPaymentSchema>;

export type InitPaymentDto = z.infer<typeof initPaymentSchema>;
