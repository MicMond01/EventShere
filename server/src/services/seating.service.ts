import { queryOne } from '../db/postgres/client';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';
import { runSeatAlgorithm } from './seating.algorithm';

export async function runSeating(eventId: string, requesterId: string) {
  const event = await queryOne<{ planner_id: string; score_influence: string }>(
    `SELECT planner_id, score_influence FROM events WHERE id = $1`, [eventId]
  );
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== requesterId) throw new ForbiddenError();

  return runSeatAlgorithm(eventId, event.score_influence !== 'off');
}
