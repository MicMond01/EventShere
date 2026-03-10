import { query, queryOne } from '../db/postgres/client';
import { AppError, ForbiddenError, NotFoundError } from '../middleware/errorHandler';
import { SCORE_TIERS, MIN_RATERS_FOR_SCORE_UPDATE, RATING_WINDOW_OPEN_HOURS, RATING_WINDOW_CLOSE_HOURS } from '@eventshere/shared';
import { SubmitRatingDto } from '../schemas/rating.schemas';

function getTier(score: number): string {
  for (const [key, tier] of Object.entries(SCORE_TIERS)) {
    if (score >= tier.min && score <= tier.max) return key.toLowerCase();
  }
  return 'standard';
}

async function recalculateSocialScore(userId: string): Promise<void> {
  const [{ count }] = await query<any>(
    `SELECT COUNT(DISTINCT rater_id) AS count FROM ratings WHERE ratee_id = $1 AND is_flagged = FALSE`, [userId]
  );
  if (Number(count) < MIN_RATERS_FOR_SCORE_UPDATE) return;

  const result = await queryOne<{ score: string }>(
    `WITH ranked AS (
       SELECT AVG((conduct_score+social_score+punctuality_score+attire_score+overall_score)/5.0) AS event_avg,
              ROW_NUMBER() OVER (ORDER BY MAX(created_at) DESC) AS recency_rank
       FROM ratings WHERE ratee_id = $1 AND is_flagged = FALSE GROUP BY event_id
     )
     SELECT SUM(event_avg * (1.0/recency_rank)) / SUM(1.0/recency_rank) AS score FROM ranked`,
    [userId]
  );
  if (!result?.score) return;

  const normalized = Math.round(((Number(result.score) - 1) / 4) * 1000);
  const clamped    = Math.min(1000, Math.max(0, normalized));
  const tier       = getTier(clamped);

  const current = await queryOne<{ score_history: any[] }>(
    `SELECT score_history FROM social_scores WHERE user_id = $1`, [userId]
  );
  const history = [...(current?.score_history ?? []), { score: clamped, tier, calculatedAt: new Date().toISOString() }];
  if (history.length > 50) history.shift();

  await query(
    `INSERT INTO social_scores (user_id,current_score,tier,last_calculated_at,score_history)
     VALUES ($1,$2,$3,NOW(),$4)
     ON CONFLICT (user_id) DO UPDATE
       SET current_score=$2, tier=$3, last_calculated_at=NOW(), score_history=$4`,
    [userId, clamped, tier, JSON.stringify(history)]
  );
}

export async function submitRating(raterId: string, dto: SubmitRatingDto) {
  if (raterId === dto.rateeId) throw new AppError('You cannot rate yourself', 400);

  const [raterAttended, rateeAttended] = await Promise.all([
    queryOne(`SELECT 1 FROM guests WHERE user_id = $1 AND event_id = $2 AND checked_in = TRUE`, [raterId, dto.eventId]),
    queryOne(`SELECT 1 FROM guests WHERE user_id = $1 AND event_id = $2 AND checked_in = TRUE`, [dto.rateeId, dto.eventId]),
  ]);
  if (!raterAttended) throw new ForbiddenError('You did not attend this event');
  if (!rateeAttended) throw new ForbiddenError('The person you are rating did not attend this event');

  const event = await queryOne<{ start_time: string; end_time: string }>(
    `SELECT start_time, end_time FROM events WHERE id = $1`, [dto.eventId]
  );
  if (!event) throw new NotFoundError('Event');

  const now          = new Date();
  const windowOpen   = new Date(event.start_time); windowOpen.setHours(windowOpen.getHours() + RATING_WINDOW_OPEN_HOURS);
  const windowClose  = new Date(event.end_time);   windowClose.setHours(windowClose.getHours() + RATING_WINDOW_CLOSE_HOURS);
  if (now < windowOpen)  throw new AppError('Rating window has not opened yet', 400);
  if (now > windowClose) throw new AppError('Rating window has closed', 400);

  const [rating] = await query(
    `INSERT INTO ratings (rater_id,ratee_id,event_id,conduct_score,social_score,punctuality_score,attire_score,overall_score,comment)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [raterId,dto.rateeId,dto.eventId,dto.conductScore,dto.socialScore,dto.punctualityScore,dto.attireScore,dto.overallScore,dto.comment]
  );

  // Fire and forget — don't block the response
  recalculateSocialScore(dto.rateeId).catch(console.error);
  return { id: rating.id, message: 'Rating submitted' };
}

export async function getMyScore(userId: string) {
  const score = await queryOne(
    `SELECT current_score, tier, last_calculated_at FROM social_scores WHERE user_id = $1`, [userId]
  );
  const [breakdown] = await query(
    `SELECT AVG(conduct_score)::numeric(3,2) AS conduct, AVG(social_score)::numeric(3,2) AS social,
            AVG(punctuality_score)::numeric(3,2) AS punctuality, AVG(attire_score)::numeric(3,2) AS attire,
            AVG(overall_score)::numeric(3,2) AS overall, COUNT(DISTINCT event_id) AS events_rated
     FROM ratings WHERE ratee_id = $1 AND is_flagged = FALSE`,
    [userId]
  );
  return { score, breakdown };
}

export async function flagRating(ratingId: string) {
  await query(`UPDATE ratings SET is_flagged = TRUE WHERE id = $1`, [ratingId]);
}
