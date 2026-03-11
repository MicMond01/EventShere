import { z } from 'zod';

export const createEventSchema = z.object({
  name:          z.string().min(3).max(200),
  type:          z.enum(['wedding','conference','birthday','product_launch','concert','funeral_reception','baby_shower','graduation','award_ceremony','religious_gathering','custom']),
  description:   z.string().optional(),
  startTime:     z.string().datetime(),
  endTime:       z.string().datetime(),
  visibility:    z.enum(['public','private','unlisted']).default('public'),
  maxGuests:     z.number().int().positive().default(100),
  rsvpDeadline:  z.string().datetime().optional(),
  coverImageUrl: z.string().url().optional(),
  venueId:       z.string().uuid().optional(),
  seatingMode:   z.enum(['automatic','manual','hybrid']).default('manual'),
  scoreInfluence:z.enum(['off','low','medium','high']).default('off'),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['draft','published','ongoing','completed','cancelled']).optional(),
});

export const addCoPlannerSchema = z.object({
  email:      z.string().email(),
  permission: z.enum(['viewer','editor','admin']).default('editor'),
});

export const addRunsheetItemSchema = z.object({
  title:       z.string().min(2).max(200),
  description: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  assignedTo:  z.string().optional(),
  sortOrder:   z.number().int().default(0),
});

export type CreateEventDto     = z.infer<typeof createEventSchema>;
export type UpdateEventDto     = z.infer<typeof updateEventSchema>;
export type AddCoPlannerDto    = z.infer<typeof addCoPlannerSchema>;
export type AddRunsheetItemDto = z.infer<typeof addRunsheetItemSchema>;
