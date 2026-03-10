import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Layout } from '../../db/mongo/layout.model';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { NotFoundError, ForbiddenError } from '../../middleware/errorHandler';
import { queryOne } from '../../db/postgres/client';

// ── Schemas ───────────────────────────────────────────────

const sceneObjectSchema = z.object({
  id:       z.string(),
  type:     z.string(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  rotation: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  scale:    z.object({ x: z.number(), y: z.number(), z: z.number() }),
  label:    z.string().optional(),
  isLocked: z.boolean().default(false),
});

const zoneSchema = z.object({
  id:       z.string(),
  name:     z.string(),
  type:     z.enum(['seating','high_table','stage','dance_floor','vendor','walkway','registration','photography','custom']),
  color:    z.string().default('#3B82F6'),
  vertices: z.array(z.object({ x: z.number(), z: z.number() })),
});

const seatSchema = z.object({
  id:           z.string(),
  seatLabel:    z.string(),
  zoneId:       z.string(),
  category:     z.string().default('general'),
  position:     z.object({ x: z.number(), y: z.number(), z: z.number() }),
  isAccessible: z.boolean().default(false),
});

const saveLayoutSchema = z.object({
  name:    z.string().min(1).max(100),
  sceneData: z.object({
    objects:        z.array(sceneObjectSchema),
    zones:          z.array(zoneSchema),
    seats:          z.array(seatSchema),
    venueModelUrl:  z.string().url().optional(),
    gridSize:       z.number().default(0.5),
  }),
});

// ── Helpers ───────────────────────────────────────────────

async function assertPlannerOwns(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(
    `SELECT planner_id FROM events WHERE id = $1`, [eventId]
  );
  if (!event) throw new NotFoundError('Event');
  const isCo = await queryOne(
    `SELECT 1 FROM event_co_planners WHERE event_id = $1 AND user_id = $2`, [eventId, userId]
  );
  if (event.planner_id !== userId && !isCo) throw new ForbiddenError();
}

// ── Handlers ──────────────────────────────────────────────

// GET /api/v1/layouts/:eventId — get all versions
async function getLayouts(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);
  const layouts = await Layout.find({ eventId: req.params.eventId })
    .select('-sceneData') // don't send full scene on list
    .sort({ createdAt: -1 });
  res.json({ success: true, data: layouts });
}

// GET /api/v1/layouts/:eventId/active — get the active layout (full)
async function getActiveLayout(req: Request, res: Response) {
  const layout = await Layout.findOne({ eventId: req.params.eventId, isActive: true });
  if (!layout) throw new NotFoundError('Layout');
  res.json({ success: true, data: layout });
}

// GET /api/v1/layouts/:eventId/:layoutId — get specific version
async function getLayoutById(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);
  const layout = await Layout.findById(req.params.layoutId);
  if (!layout || layout.eventId !== req.params.eventId) throw new NotFoundError('Layout');
  res.json({ success: true, data: layout });
}

// POST /api/v1/layouts/:eventId — save new version
async function saveLayout(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);

  // Version number = count of existing + 1
  const count = await Layout.countDocuments({ eventId: req.params.eventId });

  // Deactivate previous active layout
  await Layout.updateMany({ eventId: req.params.eventId }, { isActive: false });

  const layout = await Layout.create({
    eventId:       req.params.eventId,
    name:          req.body.name,
    versionNumber: count + 1,
    isActive:      true,
    sceneData:     req.body.sceneData,
  });

  res.status(201).json({ success: true, data: layout });
}

// PATCH /api/v1/layouts/:eventId/:layoutId/activate
async function activateLayout(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);
  await Layout.updateMany({ eventId: req.params.eventId }, { isActive: false });
  const layout = await Layout.findByIdAndUpdate(
    req.params.layoutId, { isActive: true }, { new: true }
  );
  if (!layout) throw new NotFoundError('Layout');
  res.json({ success: true, data: layout });
}

// DELETE /api/v1/layouts/:eventId/:layoutId
async function deleteLayout(req: Request, res: Response) {
  await assertPlannerOwns(req.params.eventId, req.user!.userId);
  const layout = await Layout.findById(req.params.layoutId);
  if (!layout) throw new NotFoundError('Layout');
  if (layout.isActive) throw new NotFoundError('Cannot delete the active layout');
  await layout.deleteOne();
  res.json({ success: true });
}

// GET /api/v1/layouts/:eventId/seats — extract flat seat list for algorithm
async function getSeats(req: Request, res: Response) {
  const layout = await Layout.findOne({ eventId: req.params.eventId, isActive: true });
  if (!layout) throw new NotFoundError('Active layout');
  res.json({ success: true, data: layout.sceneData.seats });
}

// ── Router ────────────────────────────────────────────────

const router = Router();

router.get   ('/:eventId',               authenticate, getLayouts);
router.get   ('/:eventId/active',        authenticate, getActiveLayout);
router.get   ('/:eventId/seats',         authenticate, getSeats);
router.get   ('/:eventId/:layoutId',     authenticate, getLayoutById);
router.post  ('/:eventId',               authenticate, validate(saveLayoutSchema), saveLayout);
router.patch ('/:eventId/:layoutId/activate', authenticate, activateLayout);
router.delete('/:eventId/:layoutId',     authenticate, deleteLayout);

export default router;
