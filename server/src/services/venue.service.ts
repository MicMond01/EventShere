import { query, queryOne } from "../db/postgres/client";
import { NotFoundError, ForbiddenError } from "../middleware/errorHandler";
import { buildSetClause, paginate, paginatedResult } from "../utils/helpers";
import {
  CreateVenueDto,
  UpdateVenueDto,
  AddMediaDto,
  BlockDateDto,
  AddReviewDto,
} from "../schemas/venue.schemas";

export async function createVenue(ownerId: string, dto: CreateVenueDto) {
  const [venue] = await query(
    `INSERT INTO venues (owner_id,name,short_desc,full_desc,type,address,city,state,country,country_code,
       lat,lng,seated_capacity,standing_capacity,length_m,width_m,height_m,amenities,
       hourly_rate,half_day_rate,full_day_rate,currency,security_deposit,cleaning_fee,min_notice_hours)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
     RETURNING *`,
    [
      ownerId,
      dto.name,
      dto.shortDesc,
      dto.fullDesc,
      dto.type,
      dto.address,
      dto.city,
      dto.state,
      dto.country,
      dto.countryCode,
      dto.lat,
      dto.lng,
      dto.seatedCapacity,
      dto.standingCapacity,
      dto.lengthM,
      dto.widthM,
      dto.heightM,
      dto.amenities,
      dto.hourlyRate,
      dto.halfDayRate,
      dto.fullDayRate,
      dto.currency,
      dto.securityDeposit,
      dto.cleaningFee,
      dto.minNoticeHours,
    ],
  );
  return venue;
}

export async function getVenueById(id: string) {
  const venue = await queryOne(
    `SELECT v.*, p.display_name AS owner_name, p.photo_url AS owner_photo
     FROM venues v
     JOIN user_profiles p ON p.user_id = v.owner_id
     WHERE v.id = $1`,
    [id],
  );
  if (!venue) throw new NotFoundError("Venue");
  const media = await query(
    `SELECT * FROM venue_media WHERE venue_id = $1 ORDER BY sort_order`,
    [id],
  );
  return { ...venue, media };
}

export async function updateVenue(
  id: string,
  requesterId: string,
  dto: UpdateVenueDto,
) {
  const venue = await queryOne<{ owner_id: string }>(
    `SELECT owner_id FROM venues WHERE id = $1`,
    [id],
  );
  if (!venue) throw new NotFoundError("Venue");
  if (venue.owner_id !== requesterId) throw new ForbiddenError();

  const fields: Record<string, unknown> = { updated_at: new Date() };
  if (dto.name !== undefined) fields.name = dto.name;
  if (dto.shortDesc !== undefined) fields.short_desc = dto.shortDesc;
  if (dto.fullDesc !== undefined) fields.full_desc = dto.fullDesc;
  if (dto.address !== undefined) fields.address = dto.address;
  if (dto.city !== undefined) fields.city = dto.city;
  if (dto.state !== undefined) fields.state = dto.state;
  if (dto.country !== undefined) fields.country = dto.country;
  if (dto.countryCode !== undefined) fields.country_code = dto.countryCode;
  if (dto.seatedCapacity !== undefined)
    fields.seated_capacity = dto.seatedCapacity;
  if (dto.standingCapacity !== undefined)
    fields.standing_capacity = dto.standingCapacity;
  if (dto.amenities !== undefined) fields.amenities = dto.amenities;
  if (dto.hourlyRate !== undefined) fields.hourly_rate = dto.hourlyRate;
  if (dto.halfDayRate !== undefined) fields.half_day_rate = dto.halfDayRate;
  if (dto.fullDayRate !== undefined) fields.full_day_rate = dto.fullDayRate;
  if (dto.minNoticeHours !== undefined)
    fields.min_notice_hours = dto.minNoticeHours;

  const { clause, values } = buildSetClause(fields);
  const [updated] = await query(
    `UPDATE venues SET ${clause} WHERE id = $${values.length + 1} RETURNING *`,
    [...values, id],
  );
  return updated;
}

export async function deleteVenue(
  id: string,
  requesterId: string,
  role: string,
) {
  const venue = await queryOne<{ owner_id: string }>(
    `SELECT owner_id FROM venues WHERE id = $1`,
    [id],
  );
  if (!venue) throw new NotFoundError("Venue");
  if (venue.owner_id !== requesterId && role !== "admin")
    throw new ForbiddenError();
  await query(`DELETE FROM venues WHERE id = $1`, [id]);
}

export async function searchVenues(params: Record<string, string>) {
  const { page, limit, offset } = paginate(
    Number(params.page),
    Number(params.limit),
  );
  const conditions: string[] = [`v.status = 'active'`];
  const values: unknown[] = [];
  let i = 1;

  if (params.city) {
    conditions.push(`LOWER(v.city) LIKE $${i++}`);
    values.push(`%${params.city.toLowerCase()}%`);
  }
  if (params.type) {
    conditions.push(`v.type = $${i++}`);
    values.push(params.type);
  }
  if (params.minCapacity) {
    conditions.push(`v.seated_capacity >= $${i++}`);
    values.push(Number(params.minCapacity));
  }
  if (params.maxCapacity) {
    conditions.push(`v.seated_capacity <= $${i++}`);
    values.push(Number(params.maxCapacity));
  }
  if (params.minPrice) {
    conditions.push(`v.full_day_rate >= $${i++}`);
    values.push(Number(params.minPrice));
  }
  if (params.maxPrice) {
    conditions.push(`v.full_day_rate <= $${i++}`);
    values.push(Number(params.maxPrice));
  }
  if (params.amenities) {
    conditions.push(`v.amenities @> $${i++}`);
    values.push(params.amenities.split(","));
  }

  const where = conditions.join(" AND ");
  const orderMap: Record<string, string> = {
    rating: "v.rating DESC NULLS LAST",
    price_asc: "v.full_day_rate ASC",
    price_desc: "v.full_day_rate DESC",
    newest: "v.created_at DESC",
  };
  const order = orderMap[params.sort] ?? "v.created_at DESC";

  const [{ count }] = await query<any>(
    `SELECT COUNT(*) FROM venues v WHERE ${where}`,
    values,
  );
  const rows = await query(
    `SELECT v.id,v.name,v.short_desc,v.type,v.city,v.state,v.seated_capacity,
            v.full_day_rate,v.currency,v.rating,v.review_count,v.is_verified,
            (SELECT url FROM venue_media WHERE venue_id=v.id AND media_type='photo' ORDER BY sort_order LIMIT 1) AS cover_photo
     FROM venues v WHERE ${where} ORDER BY ${order} LIMIT $${i++} OFFSET $${i++}`,
    [...values, limit, offset],
  );
  return paginatedResult(rows, Number(count), page, limit);
}

export async function getMyVenues(ownerId: string) {
  return query(
    `SELECT v.*, (SELECT COUNT(*) FROM bookings b WHERE b.venue_id = v.id) AS booking_count
     FROM venues v WHERE v.owner_id = $1 ORDER BY v.created_at DESC`,
    [ownerId],
  );
}

export async function addMedia(
  venueId: string,
  requesterId: string,
  dto: AddMediaDto,
) {
  const venue = await queryOne<{ owner_id: string }>(
    `SELECT owner_id FROM venues WHERE id = $1`,
    [venueId],
  );
  if (!venue) throw new NotFoundError("Venue");
  if (venue.owner_id !== requesterId) throw new ForbiddenError();
  const [media] = await query(
    `INSERT INTO venue_media (venue_id,media_type,url,thumbnail_url,sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [venueId, dto.mediaType, dto.url, dto.thumbnailUrl, dto.sortOrder],
  );
  return media;
}

export async function deleteMedia(mediaId: string, requesterId: string) {
  const row = await queryOne(
    `SELECT vm.id FROM venue_media vm JOIN venues v ON v.id = vm.venue_id
     WHERE vm.id = $1 AND v.owner_id = $2`,
    [mediaId, requesterId],
  );
  if (!row) throw new ForbiddenError("Not your media or not found");
  await query(`DELETE FROM venue_media WHERE id = $1`, [mediaId]);
}

export async function getAvailability(venueId: string, month: string) {
  return query(
    `SELECT date, is_blocked, booking_id FROM venue_availability
     WHERE venue_id = $1 AND to_char(date,'YYYY-MM') = $2 ORDER BY date`,
    [venueId, month],
  );
}

export async function setAvailability(
  venueId: string,
  requesterId: string,
  dto: BlockDateDto,
) {
  const venue = await queryOne<{ owner_id: string }>(
    `SELECT owner_id FROM venues WHERE id = $1`,
    [venueId],
  );
  if (!venue) throw new NotFoundError("Venue");
  if (venue.owner_id !== requesterId) throw new ForbiddenError();
  await query(
    `INSERT INTO venue_availability (venue_id,date,is_blocked) VALUES ($1,$2,$3)
     ON CONFLICT (venue_id,date) DO UPDATE SET is_blocked = EXCLUDED.is_blocked`,
    [venueId, dto.date, dto.isBlocked],
  );
}

export async function getReviews(venueId: string) {
  return query(
    `SELECT r.*, p.display_name AS reviewer_name, p.photo_url AS reviewer_photo
     FROM venue_reviews r
     JOIN user_profiles p ON p.user_id = r.reviewer_id
     WHERE r.venue_id = $1 ORDER BY r.created_at DESC`,
    [venueId],
  );
}

export async function addReview(
  venueId: string,
  reviewerId: string,
  dto: AddReviewDto,
) {
  const booked = await queryOne(
    `SELECT b.id FROM bookings b JOIN events e ON e.id = b.event_id
     WHERE b.venue_id = $1 AND b.planner_id = $2 AND b.status = 'completed' LIMIT 1`,
    [venueId, reviewerId],
  );
  if (!booked)
    throw new ForbiddenError(
      "You can only review venues where you completed an event",
    );
  const [review] = await query(
    `INSERT INTO venue_reviews (venue_id,reviewer_id,cleanliness,capacity_accuracy,staff_helpfulness,amenity_accuracy,overall,comment)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      venueId,
      reviewerId,
      dto.cleanliness,
      dto.capacityAccuracy,
      dto.staffHelpfulness,
      dto.amenityAccuracy,
      dto.overall,
      dto.comment,
    ],
  );
  await query(
    `UPDATE venues SET
       rating = (SELECT AVG(overall) FROM venue_reviews WHERE venue_id = $1),
       review_count = (SELECT COUNT(*) FROM venue_reviews WHERE venue_id = $1)
     WHERE id = $1`,
    [venueId],
  );
  return review;
}
