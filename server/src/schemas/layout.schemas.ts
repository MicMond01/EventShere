import { z } from 'zod';

const vec3Schema = z.object({ x: z.number(), y: z.number(), z: z.number() });

const sceneObjectSchema = z.object({
  id: z.string(), type: z.string(),
  position: vec3Schema, rotation: vec3Schema, scale: vec3Schema,
  label: z.string().optional(), isLocked: z.boolean().default(false),
});

const zoneSchema = z.object({
  id: z.string(), name: z.string(),
  type: z.enum(['seating','high_table','stage','dance_floor','vendor','walkway','registration','photography','custom']),
  color: z.string().default('#3B82F6'),
  vertices: z.array(z.object({ x: z.number(), z: z.number() })),
});

const seatSchema = z.object({
  id: z.string(), seatLabel: z.string(), zoneId: z.string(),
  category: z.string().default('general'),
  position: vec3Schema, isAccessible: z.boolean().default(false),
});

export const saveLayoutSchema = z.object({
  name: z.string().min(1).max(100),
  sceneData: z.object({
    objects:       z.array(sceneObjectSchema),
    zones:         z.array(zoneSchema),
    seats:         z.array(seatSchema),
    venueModelUrl: z.string().url().optional(),
    gridSize:      z.number().default(0.5),
  }),
});

export type SaveLayoutDto = z.infer<typeof saveLayoutSchema>;
