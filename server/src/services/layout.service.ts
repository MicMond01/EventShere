import { Layout } from '../db/mongo/layout.model';
import { queryOne } from '../db/postgres/client';
import { NotFoundError, ForbiddenError, AppError } from '../middleware/errorHandler';
import { SaveLayoutDto } from '../schemas/layout.schemas';

async function assertCanEdit(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(`SELECT planner_id FROM events WHERE id = $1`, [eventId]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id === userId) return;
  const co = await queryOne(
    `SELECT 1 FROM event_co_planners WHERE event_id = $1 AND user_id = $2`, [eventId, userId]
  );
  if (!co) throw new ForbiddenError();
}

export async function getLayouts(eventId: string, userId: string) {
  await assertCanEdit(eventId, userId);
  return Layout.find({ eventId }).select('-sceneData').sort({ createdAt: -1 });
}

export async function getActiveLayout(eventId: string) {
  const layout = await Layout.findOne({ eventId, isActive: true });
  if (!layout) throw new NotFoundError('Active layout');
  return layout;
}

export async function getLayoutById(eventId: string, layoutId: string, userId: string) {
  await assertCanEdit(eventId, userId);
  const layout = await Layout.findById(layoutId);
  if (!layout || layout.eventId !== eventId) throw new NotFoundError('Layout');
  return layout;
}

export async function saveLayout(eventId: string, userId: string, dto: SaveLayoutDto) {
  await assertCanEdit(eventId, userId);
  const count = await Layout.countDocuments({ eventId });
  await Layout.updateMany({ eventId }, { isActive: false });
  const layout = await Layout.create({
    eventId, name: dto.name,
    versionNumber: count + 1,
    isActive: true,
    sceneData: dto.sceneData,
  });
  return layout;
}

export async function activateLayout(eventId: string, layoutId: string, userId: string) {
  await assertCanEdit(eventId, userId);
  await Layout.updateMany({ eventId }, { isActive: false });
  const layout = await Layout.findByIdAndUpdate(layoutId, { isActive: true }, { new: true });
  if (!layout) throw new NotFoundError('Layout');
  return layout;
}

export async function deleteLayout(eventId: string, layoutId: string, userId: string) {
  await assertCanEdit(eventId, userId);
  const layout = await Layout.findById(layoutId);
  if (!layout) throw new NotFoundError('Layout');
  if (layout.isActive) throw new AppError('Cannot delete the active layout. Activate another version first.', 400);
  await layout.deleteOne();
}

export async function getSeats(eventId: string) {
  const layout = await Layout.findOne({ eventId, isActive: true });
  if (!layout) throw new NotFoundError('Active layout — create one in the 3D planner first');
  return layout.sceneData.seats;
}
