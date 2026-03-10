import { z } from 'zod';

export const submitRatingSchema = z.object({
  rateeId:          z.string().uuid(),
  eventId:          z.string().uuid(),
  conductScore:     z.number().int().min(1).max(5),
  socialScore:      z.number().int().min(1).max(5),
  punctualityScore: z.number().int().min(1).max(5),
  attireScore:      z.number().int().min(1).max(5),
  overallScore:     z.number().int().min(1).max(5),
  comment:          z.string().max(500).optional(),
});

export type SubmitRatingDto = z.infer<typeof submitRatingSchema>;
