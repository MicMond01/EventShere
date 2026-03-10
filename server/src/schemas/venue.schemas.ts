import { z } from 'zod';

export const createVenueSchema = z.object({
  name:             z.string().min(3).max(200),
  shortDesc:        z.string().max(160).optional(),
  fullDesc:         z.string().optional(),
  type:             z.enum(['hall','conference_center','outdoor_garden','rooftop','banquet_room','amphitheatre','warehouse','church_hall','hotel_ballroom','community_center']),
  address:          z.string().min(5),
  city:             z.string().min(2),
  state:            z.string().min(2),
  country:          z.string().default('Nigeria'),
  lat:              z.number().optional(),
  lng:              z.number().optional(),
  seatedCapacity:   z.number().int().positive(),
  standingCapacity: z.number().int().positive().optional(),
  lengthM:          z.number().positive().optional(),
  widthM:           z.number().positive().optional(),
  heightM:          z.number().positive().optional(),
  amenities:        z.array(z.string()).default([]),
  hourlyRate:       z.number().nonnegative().optional(),
  halfDayRate:      z.number().nonnegative().optional(),
  fullDayRate:      z.number().nonnegative().optional(),
  currency:         z.string().default('NGN'),
  securityDeposit:  z.number().nonnegative().optional(),
  cleaningFee:      z.number().nonnegative().optional(),
  minNoticeHours:   z.number().int().nonnegative().default(48),
});

export const updateVenueSchema = createVenueSchema.partial();

export const addMediaSchema = z.object({
  mediaType:    z.enum(['photo','video','floor_plan','model_3d','panorama']),
  url:          z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  sortOrder:    z.number().int().default(0),
});

export const blockDateSchema = z.object({
  date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isBlocked: z.boolean(),
});

export const addReviewSchema = z.object({
  cleanliness:       z.number().int().min(1).max(5),
  capacityAccuracy:  z.number().int().min(1).max(5),
  staffHelpfulness:  z.number().int().min(1).max(5),
  amenityAccuracy:   z.number().int().min(1).max(5),
  overall:           z.number().int().min(1).max(5),
  comment:           z.string().optional(),
});

export type CreateVenueDto = z.infer<typeof createVenueSchema>;
export type UpdateVenueDto = z.infer<typeof updateVenueSchema>;
export type AddMediaDto    = z.infer<typeof addMediaSchema>;
export type BlockDateDto   = z.infer<typeof blockDateSchema>;
export type AddReviewDto   = z.infer<typeof addReviewSchema>;
