/**
 * EventShere — server Setup Script
 * 
 * HOW TO USE:
 *   1. Place this file inside your "server" folder
 *   2. Open Command Prompt in that folder
 *   3. Run: node setup.js
 */

const fs   = require('fs');
const path = require('path');
const BASE = process.cwd();
const files = [
  { p: "src/index.ts", c: `import 'express-async-errors';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { connectPostgres } from './db/postgres/client';
import { connectMongo } from './db/mongo/client';
import { connectRedis } from './config/redis';
import { initSocket } from './socket';
import { globalErrorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { env } from './config/env';

// ── Route imports (one per module) ────────────────────────
import authRoutes         from './modules/auth/auth.routes';
import userRoutes         from './modules/users/user.routes';
import venueRoutes        from './modules/venues/venue.routes';
import eventRoutes        from './modules/events/event.routes';
import guestRoutes        from './modules/guests/guest.routes';
import bookingRoutes      from './modules/bookings/booking.routes';
import layoutRoutes       from './modules/layouts/layout.routes';
import invitationRoutes   from './modules/invitations/invitation.routes';
import ratingRoutes       from './modules/ratings/rating.routes';
import paymentRoutes      from './modules/payments/payment.routes';
import seatingRoutes      from './modules/seating/seating.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import searchRoutes       from './modules/search/search.routes';
import uploadRoutes       from './modules/uploads/upload.routes';
import adminRoutes        from './modules/admin/admin.routes';

const app        = express();
const httpServer = createServer(app);
const io         = new SocketServer(httpServer, {
  cors: { origin: env.CLIENT_URL, credentials: true },
});

// ── Global middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── API routes ─────────────────────────────────────────────
const API = '/api/v1';
app.use(\`\${API}/auth\`,          authRoutes);
app.use(\`\${API}/users\`,         userRoutes);
app.use(\`\${API}/venues\`,        venueRoutes);
app.use(\`\${API}/events\`,        eventRoutes);
app.use(\`\${API}/guests\`,        guestRoutes);
app.use(\`\${API}/bookings\`,      bookingRoutes);
app.use(\`\${API}/layouts\`,       layoutRoutes);
app.use(\`\${API}/invitations\`,   invitationRoutes);
app.use(\`\${API}/ratings\`,       ratingRoutes);
app.use(\`\${API}/payments\`,      paymentRoutes);
app.use(\`\${API}/seating\`,       seatingRoutes);
app.use(\`\${API}/notifications\`, notificationRoutes);
app.use(\`\${API}/search\`,        searchRoutes);
app.use(\`\${API}/uploads\`,       uploadRoutes);
app.use(\`\${API}/admin\`,         adminRoutes);

// ── Socket.IO ──────────────────────────────────────────────
initSocket(io);

// ── Error handling (must be last) ─────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

// ── Start ──────────────────────────────────────────────────
async function start() {
  await connectPostgres();
  await connectMongo();
  await connectRedis();
  httpServer.listen(env.PORT, () => {
    console.log(\`🚀  Server running on http://localhost:\${env.PORT}\`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
` },
  { p: "src/config/cloudinary.ts", c: `import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.CLOUDINARY.CLOUD_NAME,
  api_key:    env.CLOUDINARY.API_KEY,
  api_secret: env.CLOUDINARY.API_SECRET,
});

export default cloudinary;
` },
  { p: "src/config/env.ts", c: `import 'dotenv/config';

function require_env(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(\`Missing required environment variable: \${key}\`);
  return value;
}

export const env = {
  NODE_ENV:   process.env.NODE_ENV || 'development',
  PORT:       Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  POSTGRES: {
    HOST:     process.env.POSTGRES_HOST     || 'localhost',
    PORT:     Number(process.env.POSTGRES_PORT) || 5432,
    USER:     process.env.POSTGRES_USER     || 'eventshere_user',
    PASSWORD: process.env.POSTGRES_PASSWORD || 'eventshere_pass',
    DB:       process.env.POSTGRES_DB       || 'eventshere_db',
  },

  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/eventshere_layouts',

  REDIS: {
    HOST: process.env.REDIS_HOST || 'localhost',
    PORT: Number(process.env.REDIS_PORT) || 6379,
  },

  JWT: {
    ACCESS_SECRET:      require_env('JWT_ACCESS_SECRET'),
    REFRESH_SECRET:     require_env('JWT_REFRESH_SECRET'),
    ACCESS_EXPIRES_IN:  process.env.JWT_ACCESS_EXPIRES_IN  || '15m',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  CLOUDINARY: {
    CLOUD_NAME:  process.env.CLOUDINARY_CLOUD_NAME  || '',
    API_KEY:     process.env.CLOUDINARY_API_KEY     || '',
    API_SECRET:  process.env.CLOUDINARY_API_SECRET  || '',
  },

  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  EMAIL_FROM:       process.env.EMAIL_FROM || 'noreply@eventshere.com',

  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || '',
} as const;
` },
  { p: "src/config/redis.ts", c: `import { createClient, RedisClientType } from 'redis';
import { env } from './env';

let client: RedisClientType;

export function getRedis(): RedisClientType {
  if (!client) throw new Error('Redis not initialised — call connectRedis() first');
  return client;
}

export async function connectRedis(): Promise<void> {
  client = createClient({
    socket: { host: env.REDIS.HOST, port: env.REDIS.PORT },
  }) as RedisClientType;

  client.on('error', (err) => console.error('[Redis]', err));
  await client.connect();
  console.log('✅  Redis connected');
}

export async function setCache(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  await getRedis().setEx(key, ttlSeconds, JSON.stringify(value));
}

export async function getCache<T>(key: string): Promise<T | null> {
  const raw = await getRedis().get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function deleteCache(key: string): Promise<void> {
  await getRedis().del(key);
}
` },
  { p: "src/db/mongo/client.ts", c: `import mongoose from 'mongoose';
import { env } from '../../config/env';

export async function connectMongo(): Promise<void> {
  await mongoose.connect(env.MONGO_URI);
  console.log('✅  MongoDB connected');
}
` },
  { p: "src/db/mongo/layout.model.ts", c: `import { Schema, model, Document } from 'mongoose';

interface IVec3 { x: number; y: number; z: number; }

interface ISceneObject {
  id: string; type: string;
  position: IVec3; rotation: IVec3; scale: IVec3;
  label?: string; isLocked: boolean;
}

interface IZone {
  id: string; name: string;
  type: string; color: string;
  vertices: { x: number; z: number }[];
}

interface ISeat {
  id: string; seatLabel: string; zoneId: string;
  category: string; position: IVec3; isAccessible: boolean;
}

interface ISceneData {
  objects: ISceneObject[];
  zones: IZone[];
  seats: ISeat[];
  venueModelUrl?: string;
  gridSize: number;
}

export interface ILayoutDocument extends Document {
  eventId: string;
  name: string;
  versionNumber: number;
  isActive: boolean;
  sceneData: ISceneData;
  createdAt: Date;
  updatedAt: Date;
}

const Vec3Schema = new Schema<IVec3>(
  { x: Number, y: Number, z: Number },
  { _id: false }
);

const SceneObjectSchema = new Schema<ISceneObject>(
  {
    id: String, type: String,
    position: Vec3Schema, rotation: Vec3Schema, scale: Vec3Schema,
    label: String, isLocked: { type: Boolean, default: false },
  },
  { _id: false }
);

const ZoneSchema = new Schema<IZone>(
  {
    id: String, name: String, type: String,
    color: { type: String, default: '#3B82F6' },
    vertices: [{ x: Number, z: Number }],
  },
  { _id: false }
);

const SeatSchema = new Schema<ISeat>(
  {
    id: String, seatLabel: String, zoneId: String,
    category: { type: String, default: 'general' },
    position: Vec3Schema,
    isAccessible: { type: Boolean, default: false },
  },
  { _id: false }
);

const LayoutSchema = new Schema<ILayoutDocument>(
  {
    eventId:       { type: String, required: true, index: true },
    name:          { type: String, required: true },
    versionNumber: { type: Number, required: true },
    isActive:      { type: Boolean, default: false },
    sceneData: {
      objects:       [SceneObjectSchema],
      zones:         [ZoneSchema],
      seats:         [SeatSchema],
      venueModelUrl: String,
      gridSize:      { type: Number, default: 0.5 },
    },
  },
  { timestamps: true }
);

export const Layout = model<ILayoutDocument>('Layout', LayoutSchema);
` },
  { p: "src/db/postgres/client.ts", c: `import { Pool, PoolClient } from 'pg';
import { env } from '../../config/env';

let pool: Pool;

export function getPool(): Pool {
  if (!pool) throw new Error('PostgreSQL not initialised — call connectPostgres() first');
  return pool;
}

export async function connectPostgres(): Promise<void> {
  pool = new Pool({
    host:     env.POSTGRES.HOST,
    port:     env.POSTGRES.PORT,
    user:     env.POSTGRES.USER,
    password: env.POSTGRES.PASSWORD,
    database: env.POSTGRES.DB,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });

  const client = await pool.connect();
  client.release();
  console.log('✅  PostgreSQL connected');
}

/** Run a query and return all rows */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

/** Run a query and return the first row or null */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Run multiple queries in a single transaction */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
` },
  { p: "src/db/postgres/migrate.ts", c: `import 'dotenv/config';
import { connectPostgres, getPool } from './client';

const SQL = \`
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(30)  NOT NULL CHECK (role IN ('venue_owner','planner','guest','vendor','admin')),
  status     VARCHAR(30)  NOT NULL DEFAULT 'active'
             CHECK (status IN ('active','suspended','banned','pending_verification')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(100) NOT NULL,
  photo_url    TEXT,
  bio          TEXT,
  phone        VARCHAR(20),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_scores (
  user_id            UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_score      INTEGER     NOT NULL DEFAULT 500,
  tier               VARCHAR(20) NOT NULL DEFAULT 'standard',
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score_history      JSONB       NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  is_revoked BOOLEAN     NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── VENUES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venues (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  name              VARCHAR(200) NOT NULL,
  short_desc        VARCHAR(160),
  full_desc         TEXT,
  type              VARCHAR(30)  NOT NULL,
  address           TEXT         NOT NULL,
  city              VARCHAR(100) NOT NULL,
  state             VARCHAR(100) NOT NULL,
  country           VARCHAR(100) NOT NULL DEFAULT 'Nigeria',
  lat               DECIMAL(10,7),
  lng               DECIMAL(10,7),
  seated_capacity   INTEGER,
  standing_capacity INTEGER,
  length_m          DECIMAL(8,2),
  width_m           DECIMAL(8,2),
  height_m          DECIMAL(8,2),
  amenities         TEXT[]       DEFAULT '{}',
  hourly_rate       DECIMAL(12,2),
  half_day_rate     DECIMAL(12,2),
  full_day_rate     DECIMAL(12,2),
  currency          VARCHAR(10)  NOT NULL DEFAULT 'NGN',
  security_deposit  DECIMAL(12,2),
  cleaning_fee      DECIMAL(12,2),
  min_notice_hours  INTEGER      NOT NULL DEFAULT 48,
  status            VARCHAR(20)  NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','pending_review','active','suspended')),
  is_verified       BOOLEAN      NOT NULL DEFAULT FALSE,
  rating            DECIMAL(3,2),
  review_count      INTEGER      NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_media (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id      UUID REFERENCES venues(id) ON DELETE CASCADE,
  media_type    VARCHAR(20) NOT NULL CHECK (media_type IN ('photo','video','floor_plan','model_3d','panorama')),
  url           TEXT        NOT NULL,
  thumbnail_url TEXT,
  sort_order    INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_availability (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id   UUID REFERENCES venues(id) ON DELETE CASCADE,
  date       DATE    NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  booking_id UUID,
  UNIQUE (venue_id, date)
);

CREATE TABLE IF NOT EXISTS venue_reviews (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id          UUID REFERENCES venues(id) ON DELETE CASCADE,
  reviewer_id       UUID REFERENCES users(id),
  event_id          UUID,
  cleanliness       SMALLINT CHECK (cleanliness       BETWEEN 1 AND 5),
  capacity_accuracy SMALLINT CHECK (capacity_accuracy BETWEEN 1 AND 5),
  staff_helpfulness SMALLINT CHECK (staff_helpfulness BETWEEN 1 AND 5),
  amenity_accuracy  SMALLINT CHECK (amenity_accuracy  BETWEEN 1 AND 5),
  overall           SMALLINT CHECK (overall           BETWEEN 1 AND 5),
  comment           TEXT,
  owner_response    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── EVENTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planner_id       UUID REFERENCES users(id),
  venue_id         UUID REFERENCES venues(id),
  name             VARCHAR(200) NOT NULL,
  type             VARCHAR(30)  NOT NULL,
  description      TEXT,
  start_time       TIMESTAMPTZ  NOT NULL,
  end_time         TIMESTAMPTZ  NOT NULL,
  visibility       VARCHAR(10)  NOT NULL DEFAULT 'private'
                   CHECK (visibility IN ('public','private','unlisted')),
  status           VARCHAR(20)  NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','published','ongoing','completed','cancelled')),
  max_guests       INTEGER      NOT NULL DEFAULT 100,
  rsvp_deadline    TIMESTAMPTZ,
  cover_image_url  TEXT,
  slug             VARCHAR(255) UNIQUE,
  seating_mode     VARCHAR(10)  NOT NULL DEFAULT 'manual'
                   CHECK (seating_mode IN ('automatic','manual','hybrid')),
  score_influence  VARCHAR(10)  NOT NULL DEFAULT 'off'
                   CHECK (score_influence IN ('off','low','medium','high')),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_co_planners (
  event_id   UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id)  ON DELETE CASCADE,
  permission VARCHAR(10) NOT NULL DEFAULT 'editor'
             CHECK (permission IN ('viewer','editor','admin')),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS event_runsheet (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  scheduled_at TIMESTAMPTZ,
  assigned_to  VARCHAR(100),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

-- ── GUESTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guests (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id         UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES users(id),
  name             VARCHAR(200) NOT NULL,
  email            VARCHAR(255),
  phone            VARCHAR(20),
  category         VARCHAR(20)  NOT NULL DEFAULT 'general'
                   CHECK (category IN ('vip','dignitary','family','general','press','vendor_staff')),
  rsvp_status      VARCHAR(15)  NOT NULL DEFAULT 'pending'
                   CHECK (rsvp_status IN ('pending','confirmed','declined','tentative','waitlisted')),
  checked_in       BOOLEAN      NOT NULL DEFAULT FALSE,
  checked_in_at    TIMESTAMPTZ,
  qr_code          TEXT,
  notes            TEXT,
  dietary_req      TEXT,
  accessibility_req TEXT,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seat_assignments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id    UUID REFERENCES guests(id) ON DELETE CASCADE,
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE,
  seat_label  VARCHAR(50)  NOT NULL,
  zone_name   VARCHAR(100),
  assigned_by VARCHAR(10)  NOT NULL DEFAULT 'manual'
              CHECK (assigned_by IN ('algorithm','manual')),
  assigned_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (guest_id, event_id)
);

-- ── BOOKINGS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id             UUID REFERENCES venues(id),
  event_id             UUID REFERENCES events(id),
  planner_id           UUID REFERENCES users(id),
  status               VARCHAR(20) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','accepted','declined','counter_offered','confirmed','cancelled','completed')),
  total_amount         DECIMAL(12,2) NOT NULL,
  platform_fee         DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_status       VARCHAR(10)   NOT NULL DEFAULT 'unpaid'
                       CHECK (payment_status IN ('unpaid','partial','paid','refunded')),
  event_date           DATE          NOT NULL,
  message              TEXT,
  special_requirements TEXT,
  paystack_ref         VARCHAR(100),
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── INVITATIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invitations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
  guest_id     UUID REFERENCES guests(id) ON DELETE CASCADE,
  token        VARCHAR(255) UNIQUE NOT NULL,
  status       VARCHAR(15)  NOT NULL DEFAULT 'sent'
               CHECK (status IN ('sent','viewed','responded','expired')),
  channel      VARCHAR(10)  NOT NULL DEFAULT 'email'
               CHECK (channel IN ('email','sms','whatsapp','in_app')),
  sent_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  viewed_at    TIMESTAMPTZ,
  responded_at TIMESTAMPTZ
);

-- ── RATINGS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rater_id          UUID REFERENCES users(id),
  ratee_id          UUID REFERENCES users(id),
  event_id          UUID REFERENCES events(id),
  conduct_score     SMALLINT NOT NULL CHECK (conduct_score     BETWEEN 1 AND 5),
  social_score      SMALLINT NOT NULL CHECK (social_score      BETWEEN 1 AND 5),
  punctuality_score SMALLINT NOT NULL CHECK (punctuality_score BETWEEN 1 AND 5),
  attire_score      SMALLINT NOT NULL CHECK (attire_score      BETWEEN 1 AND 5),
  overall_score     SMALLINT NOT NULL CHECK (overall_score     BETWEEN 1 AND 5),
  comment           TEXT,
  is_flagged        BOOLEAN  NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (rater_id, ratee_id, event_id)
);

-- ── VENDORS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id            UUID REFERENCES events(id) ON DELETE CASCADE,
  name                VARCHAR(200) NOT NULL,
  service_type        VARCHAR(50),
  contact_email       VARCHAR(255),
  contact_phone       VARCHAR(20),
  assigned_zone       VARCHAR(100),
  confirmation_status VARCHAR(15) NOT NULL DEFAULT 'pending'
                      CHECK (confirmation_status IN ('pending','confirmed','cancelled')),
  arrival_time        TIMESTAMPTZ,
  setup_notes         TEXT,
  qr_code             TEXT,
  arrived_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── NOTIFICATIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL,
  title           VARCHAR(200),
  body            TEXT,
  data            JSONB,
  channel         VARCHAR(10) NOT NULL CHECK (channel IN ('push','email','sms','in_app')),
  delivery_status VARCHAR(15) NOT NULL DEFAULT 'pending'
                  CHECK (delivery_status IN ('pending','sent','delivered','failed')),
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INDEXES ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_venues_city          ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_status        ON venues(status);
CREATE INDEX IF NOT EXISTS idx_events_planner       ON events(planner_id);
CREATE INDEX IF NOT EXISTS idx_events_status        ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_time    ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_guests_event         ON guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_rsvp          ON guests(rsvp_status);
CREATE INDEX IF NOT EXISTS idx_bookings_venue        ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_planner      ON bookings(planner_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ratee         ON ratings(ratee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user   ON refresh_tokens(user_id);
\`;

async function migrate() {
  await connectPostgres();
  console.log('🔄  Running migrations...');
  await getPool().query(SQL);
  console.log('✅  Migrations complete');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});
` },
  { p: "src/middleware/auth.middleware.ts", c: `import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from './errorHandler';
import { UserRole } from '@eventshere/shared';

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('No token provided');

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT.ACCESS_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }
    next();
  };
}
` },
  { p: "src/middleware/errorHandler.ts", c: `import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError     extends AppError { constructor(resource = 'Resource') { super(\`\${resource} not found\`, 404); } }
export class UnauthorizedError extends AppError { constructor(msg = 'Unauthorized')  { super(msg, 401); } }
export class ForbiddenError    extends AppError { constructor(msg = 'Forbidden')     { super(msg, 403); } }
export class ValidationError   extends AppError { constructor(msg: string)           { super(msg, 400); } }
export class ConflictError     extends AppError { constructor(msg: string)           { super(msg, 409); } }

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('Unexpected error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
}
` },
  { p: "src/middleware/notFound.ts", c: `import { Request, Response } from 'express';

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ success: false, message: \`Route \${req.method} \${req.path} not found\` });
}
` },
  { p: "src/middleware/validate.middleware.ts", c: `import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './errorHandler';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors.map(e => \`\${e.path.join('.')}: \${e.message}\`).join(', ');
        throw new ValidationError(message);
      }
      throw err;
    }
  };
}
` },
  { p: "src/modules/admin/admin.controller.ts", c: `import { Request, Response } from 'express';
import { AuthRequest } from '../../types';
import * as adminService from './admin.service';

export async function getPlatformStats(_req: Request, res: Response): Promise<void> {
  const data = await adminService.getPlatformStats();
  res.json({ success: true, data });
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const data = await adminService.listUsers(req.query as Record<string, string>);
  res.json({ success: true, data });
}

export async function updateUserStatus(req: Request, res: Response): Promise<void> {
  await adminService.updateUserStatus(req.params.id, req.body.status);
  res.json({ success: true });
}

export async function getPendingVenues(_req: Request, res: Response): Promise<void> {
  const data = await adminService.getPendingVenues();
  res.json({ success: true, data });
}

export async function reviewVenue(req: Request, res: Response): Promise<void> {
  await adminService.reviewVenue(req.params.id, req.body.action);
  res.json({ success: true });
}

export async function getFlaggedRatings(_req: Request, res: Response): Promise<void> {
  const data = await adminService.getFlaggedRatings();
  res.json({ success: true, data });
}

export async function deleteRating(req: Request, res: Response): Promise<void> {
  await adminService.deleteRating(req.params.id);
  res.json({ success: true });
}
` },
  { p: "src/modules/admin/admin.routes.ts", c: `import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import * as adminController from './admin.controller';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get   ('/stats',              adminController.getPlatformStats);
router.get   ('/users',              adminController.listUsers);
router.patch ('/users/:id/status',   adminController.updateUserStatus);
router.get   ('/venues/pending',     adminController.getPendingVenues);
router.patch ('/venues/:id/review',  adminController.reviewVenue);
router.get   ('/ratings/flagged',    adminController.getFlaggedRatings);
router.delete('/ratings/:id',        adminController.deleteRating);

export default router;
` },
  { p: "src/modules/admin/admin.service.ts", c: `import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError } from '../../middleware/errorHandler';
import { paginate } from '../../utils/helpers';

export async function getPlatformStats() {
  const [stats] = await query(\`
    SELECT
      (SELECT COUNT(*) FROM users)                                  AS total_users,
      (SELECT COUNT(*) FROM users WHERE role='planner')            AS planners,
      (SELECT COUNT(*) FROM users WHERE role='venue_owner')        AS venue_owners,
      (SELECT COUNT(*) FROM venues WHERE status='active')          AS active_venues,
      (SELECT COUNT(*) FROM venues WHERE status='pending_review')  AS pending_venues,
      (SELECT COUNT(*) FROM events WHERE status='published')       AS published_events,
      (SELECT COUNT(*) FROM bookings WHERE status='confirmed')     AS confirmed_bookings,
      (SELECT COALESCE(SUM(platform_fee),0) FROM bookings WHERE payment_status='paid') AS total_revenue
  \`);
  return stats;
}

export async function listUsers(params: Record<string, string>) {
  const { page, limit, offset } = paginate(Number(params.page), Number(params.limit));
  const search = params.search ? \`%\${params.search.toLowerCase()}%\` : null;
  const rows = search
    ? await query(
        \`SELECT u.id,u.email,u.role,u.status,u.created_at,p.display_name
         FROM users u JOIN user_profiles p ON p.user_id=u.id
         WHERE LOWER(u.email) LIKE $1 OR LOWER(p.display_name) LIKE $1
         ORDER BY u.created_at DESC LIMIT $2 OFFSET $3\`,
        [search, limit, offset]
      )
    : await query(
        \`SELECT u.id,u.email,u.role,u.status,u.created_at,p.display_name
         FROM users u JOIN user_profiles p ON p.user_id=u.id
         ORDER BY u.created_at DESC LIMIT $1 OFFSET $2\`,
        [limit, offset]
      );
  return rows;
}

export async function updateUserStatus(userId: string, status: string) {
  const user = await queryOne(\`SELECT id FROM users WHERE id = $1\`, [userId]);
  if (!user) throw new NotFoundError('User');
  await query(\`UPDATE users SET status=$1, updated_at=NOW() WHERE id=$2\`, [status, userId]);
}

export async function getPendingVenues() {
  return query(
    \`SELECT v.*, p.display_name AS owner_name
     FROM venues v JOIN user_profiles p ON p.user_id=v.owner_id
     WHERE v.status='pending_review' ORDER BY v.created_at ASC\`
  );
}

export async function reviewVenue(venueId: string, action: 'approve' | 'reject') {
  const status = action === 'approve' ? 'active' : 'suspended';
  await query(\`UPDATE venues SET status=$1, updated_at=NOW() WHERE id=$2\`, [status, venueId]);
}

export async function getFlaggedRatings() {
  return query(
    \`SELECT r.*, rp.display_name AS ratee_name, e.name AS event_name
     FROM ratings r
     JOIN user_profiles rp ON rp.user_id=r.ratee_id
     JOIN events e ON e.id=r.event_id
     WHERE r.is_flagged=TRUE ORDER BY r.created_at DESC\`
  );
}

export async function deleteRating(ratingId: string) {
  await query(\`DELETE FROM ratings WHERE id=$1\`, [ratingId]);
}
` },
  { p: "src/modules/auth/auth.controller.ts", c: `import { Request, Response } from 'express';
import { AuthRequest } from '../../types';
import * as authService from './auth.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken } = await authService.register(req.body);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.status(201).json({ success: true, data: { accessToken } });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken } = await authService.login(req.body);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.json({ success: true, data: { accessToken } });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) {
    res.status(401).json({ success: false, message: 'No refresh token provided' });
    return;
  }
  const { accessToken, refreshToken } = await authService.refreshTokens(token);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.json({ success: true, data: { accessToken } });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken as string | undefined;
  if (token) await authService.logout(token);
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const data = await authService.getMe(req.user.userId);
  res.json({ success: true, data });
}
` },
  { p: "src/modules/auth/auth.routes.ts", c: `import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { registerSchema, loginSchema } from './auth.schemas';
import * as authController from './auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login',    validate(loginSchema),    authController.login);
router.post('/refresh',                            authController.refresh);
router.post('/logout',                             authController.logout);
router.get ('/me',       authenticate,             authController.getMe as any);

export default router;
` },
  { p: "src/modules/auth/auth.schemas.ts", c: `import { z } from 'zod';

export const registerSchema = z.object({
  email:       z.string().email(),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).max(100),
  role:        z.enum(['venue_owner', 'planner', 'guest', 'vendor']),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8),
});

export type RegisterDto      = z.infer<typeof registerSchema>;
export type LoginDto         = z.infer<typeof loginSchema>;
export type ForgotPasswordDto= z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
` },
  { p: "src/modules/auth/auth.service.ts", c: `import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, queryOne, withTransaction } from '../../db/postgres/client';
import { env } from '../../config/env';
import { DEFAULT_SOCIAL_SCORE } from '@eventshere/shared';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../middleware/errorHandler';
import { RegisterDto, LoginDto } from './auth.schemas';

interface TokenPair { accessToken: string; refreshToken: string; }

function signAccess(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, env.JWT.ACCESS_SECRET, { expiresIn: env.JWT.ACCESS_EXPIRES_IN } as any);
}

function signRefresh(): string {
  return crypto.randomBytes(64).toString('hex');
}

async function saveRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await query(
    \`INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)\`,
    [userId, token, expiresAt]
  );
}

// ── Public service functions ───────────────────────────────

export async function register(dto: RegisterDto): Promise<TokenPair> {
  const existing = await queryOne(\`SELECT id FROM users WHERE email = $1\`, [dto.email]);
  if (existing) throw new ConflictError('An account with this email already exists');

  const hashed = await bcrypt.hash(dto.password, 12);

  const user = await withTransaction(async (client) => {
    const { rows: [newUser] } = await client.query(
      \`INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *\`,
      [dto.email.toLowerCase(), hashed, dto.role]
    );
    await client.query(
      \`INSERT INTO user_profiles (user_id, display_name) VALUES ($1, $2)\`,
      [newUser.id, dto.displayName]
    );
    await client.query(
      \`INSERT INTO social_scores (user_id, current_score, tier) VALUES ($1, $2, 'standard')\`,
      [newUser.id, DEFAULT_SOCIAL_SCORE]
    );
    return newUser;
  });

  const accessToken  = signAccess({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefresh();
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
}

export async function login(dto: LoginDto): Promise<TokenPair> {
  const user = await queryOne<{ id: string; email: string; password: string; role: string; status: string }>(
    \`SELECT id, email, password, role, status FROM users WHERE email = $1\`,
    [dto.email.toLowerCase()]
  );
  if (!user) throw new UnauthorizedError('Invalid email or password');
  if (user.status !== 'active') throw new UnauthorizedError('Your account has been suspended');

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  const accessToken  = signAccess({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefresh();
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
}

export async function refreshTokens(oldToken: string): Promise<TokenPair> {
  const stored = await queryOne<{ id: string; user_id: string; expires_at: Date; is_revoked: boolean }>(
    \`SELECT id, user_id, expires_at, is_revoked FROM refresh_tokens WHERE token = $1\`,
    [oldToken]
  );
  if (!stored || stored.is_revoked || new Date() > new Date(stored.expires_at)) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Rotation — revoke the old one
  await query(\`UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = $1\`, [stored.id]);

  const user = await queryOne<{ id: string; email: string; role: string }>(
    \`SELECT id, email, role FROM users WHERE id = $1\`, [stored.user_id]
  );
  if (!user) throw new UnauthorizedError('User no longer exists');

  const accessToken  = signAccess({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefresh();
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
}

export async function logout(refreshToken: string): Promise<void> {
  await query(\`UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1\`, [refreshToken]);
}

export async function getMe(userId: string) {
  const user = await queryOne(
    \`SELECT u.id, u.email, u.role, u.status, u.created_at,
            p.display_name, p.photo_url, p.bio, p.phone,
            ss.current_score, ss.tier
     FROM users u
     JOIN user_profiles p  ON p.user_id = u.id
     LEFT JOIN social_scores ss ON ss.user_id = u.id
     WHERE u.id = $1\`,
    [userId]
  );
  if (!user) throw new NotFoundError('User');
  return user;
}
` },
  { p: "src/modules/bookings/booking.controller.ts", c: `import { Response } from 'express';
import { AuthRequest } from '../../types';
import * as bookingService from './booking.service';

export async function createBooking(req: AuthRequest, res: Response): Promise<void> {
  const data = await bookingService.createBooking(req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function respondToBooking(req: AuthRequest, res: Response): Promise<void> {
  const data = await bookingService.respondToBooking(req.params.id, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function confirmBooking(req: AuthRequest, res: Response): Promise<void> {
  const data = await bookingService.confirmBooking(req.params.id, req.user.userId);
  res.json({ success: true, data });
}

export async function getMyBookings(req: AuthRequest, res: Response): Promise<void> {
  const data = await bookingService.getMyBookings(req.user.userId, req.user.role);
  res.json({ success: true, data });
}

export async function getBookingById(req: AuthRequest, res: Response): Promise<void> {
  const data = await bookingService.getBookingById(req.params.id, req.user.userId);
  res.json({ success: true, data });
}
` },
  { p: "src/modules/bookings/booking.routes.ts", c: `import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createBookingSchema, respondBookingSchema } from './booking.schemas';
import * as bookingController from './booking.controller';

const router = Router();

router.get ('/',                authenticate,                           bookingController.getMyBookings as any);
router.get ('/:id',             authenticate,                           bookingController.getBookingById as any);
router.post('/',                authenticate, authorize('planner'),     validate(createBookingSchema),   bookingController.createBooking as any);
router.patch('/:id/respond',    authenticate, authorize('venue_owner'), validate(respondBookingSchema),  bookingController.respondToBooking as any);
router.patch('/:id/confirm',    authenticate, authorize('planner'),                                      bookingController.confirmBooking as any);

export default router;
` },
  { p: "src/modules/bookings/booking.schemas.ts", c: `import { z } from 'zod';

export const createBookingSchema = z.object({
  venueId:             z.string().uuid(),
  eventId:             z.string().uuid(),
  eventDate:           z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
  totalAmount:         z.number().positive(),
  message:             z.string().optional(),
  specialRequirements: z.string().optional(),
});

export const respondBookingSchema = z.object({
  action:        z.enum(['accept','decline','counter_offer']),
  message:       z.string().optional(),
  counterAmount: z.number().positive().optional(),
});

export type CreateBookingDto  = z.infer<typeof createBookingSchema>;
export type RespondBookingDto = z.infer<typeof respondBookingSchema>;
` },
  { p: "src/modules/bookings/booking.service.ts", c: `import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError, ForbiddenError, AppError, ConflictError } from '../../middleware/errorHandler';
import { PLATFORM_COMMISSION_RATE } from '@eventshere/shared';
import { CreateBookingDto, RespondBookingDto } from './booking.schemas';

export async function createBooking(plannerId: string, dto: CreateBookingDto) {
  const venue = await queryOne<{ id: string; owner_id: string }>(
    \`SELECT id, owner_id FROM venues WHERE id = $1 AND status = 'active'\`, [dto.venueId]
  );
  if (!venue) throw new NotFoundError('Venue');

  const blocked = await queryOne(
    \`SELECT 1 FROM venue_availability WHERE venue_id = $1 AND date = $2 AND is_blocked = TRUE\`,
    [dto.venueId, dto.eventDate]
  );
  if (blocked) throw new ConflictError('Venue is not available on this date');

  const platformFee = dto.totalAmount * PLATFORM_COMMISSION_RATE;
  const [booking] = await query(
    \`INSERT INTO bookings (venue_id,event_id,planner_id,total_amount,platform_fee,event_date,message,special_requirements)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *\`,
    [dto.venueId,dto.eventId,plannerId,dto.totalAmount,platformFee,dto.eventDate,dto.message,dto.specialRequirements]
  );
  return booking;
}

export async function respondToBooking(bookingId: string, ownerId: string, dto: RespondBookingDto) {
  const booking = await queryOne<{ id: string; venue_id: string; event_date: string; status: string }>(
    \`SELECT b.id, b.venue_id, b.event_date, b.status FROM bookings b
     JOIN venues v ON v.id = b.venue_id
     WHERE b.id = $1 AND v.owner_id = $2\`,
    [bookingId, ownerId]
  );
  if (!booking) throw new ForbiddenError('Booking not found or not your venue');
  if (booking.status !== 'pending') throw new AppError('Booking has already been responded to', 409);

  const statusMap: Record<string, string> = {
    accept: 'accepted', decline: 'declined', counter_offer: 'counter_offered',
  };
  const [updated] = await query(
    \`UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *\`,
    [statusMap[dto.action], bookingId]
  );

  if (dto.action === 'accept') {
    await query(
      \`INSERT INTO venue_availability (venue_id,date,is_blocked,booking_id) VALUES ($1,$2,TRUE,$3)
       ON CONFLICT (venue_id,date) DO UPDATE SET is_blocked = TRUE, booking_id = EXCLUDED.booking_id\`,
      [booking.venue_id, booking.event_date, bookingId]
    );
  }
  return updated;
}

export async function confirmBooking(bookingId: string, plannerId: string) {
  const booking = await queryOne<{ planner_id: string; status: string }>(
    \`SELECT planner_id, status FROM bookings WHERE id = $1\`, [bookingId]
  );
  if (!booking) throw new NotFoundError('Booking');
  if (booking.planner_id !== plannerId) throw new ForbiddenError();
  if (booking.status !== 'accepted') throw new AppError('Booking must be accepted before confirming', 400);
  const [updated] = await query(
    \`UPDATE bookings SET status = 'confirmed', updated_at = NOW() WHERE id = $1 RETURNING *\`, [bookingId]
  );
  return updated;
}

export async function getMyBookings(userId: string, role: string) {
  if (role === 'planner') {
    return query(
      \`SELECT b.*, v.name AS venue_name, v.city AS venue_city, e.name AS event_name
       FROM bookings b JOIN venues v ON v.id = b.venue_id JOIN events e ON e.id = b.event_id
       WHERE b.planner_id = $1 ORDER BY b.created_at DESC\`,
      [userId]
    );
  }
  return query(
    \`SELECT b.*, v.name AS venue_name, e.name AS event_name, p.display_name AS planner_name
     FROM bookings b JOIN venues v ON v.id = b.venue_id JOIN events e ON e.id = b.event_id
     JOIN user_profiles p ON p.user_id = b.planner_id
     WHERE v.owner_id = $1 ORDER BY b.created_at DESC\`,
    [userId]
  );
}

export async function getBookingById(bookingId: string, userId: string) {
  const booking = await queryOne(
    \`SELECT b.*, v.name AS venue_name, e.name AS event_name
     FROM bookings b JOIN venues v ON v.id = b.venue_id JOIN events e ON e.id = b.event_id
     WHERE b.id = $1\`,
    [bookingId]
  );
  if (!booking) throw new NotFoundError('Booking');
  return booking;
}
` },
  { p: "src/modules/events/event.controller.ts", c: `import { Request, Response } from 'express';
import { AuthRequest } from '../../types';
import * as eventService from './event.service';

export async function createEvent(req: AuthRequest, res: Response): Promise<void> {
  const data = await eventService.createEvent(req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function getEventById(req: AuthRequest, res: Response): Promise<void> {
  const data = await eventService.getEventById(req.params.id, req.user?.userId);
  res.json({ success: true, data });
}

export async function getEventBySlug(req: Request, res: Response): Promise<void> {
  const data = await eventService.getEventBySlug(req.params.slug);
  res.json({ success: true, data });
}

export async function updateEvent(req: AuthRequest, res: Response): Promise<void> {
  const data = await eventService.updateEvent(req.params.id, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function deleteEvent(req: AuthRequest, res: Response): Promise<void> {
  await eventService.deleteEvent(req.params.id, req.user.userId);
  res.json({ success: true });
}

export async function getMyEvents(req: AuthRequest, res: Response): Promise<void> {
  const data = await eventService.getMyEvents(req.user.userId);
  res.json({ success: true, data });
}

export async function getPublicEvents(req: Request, res: Response): Promise<void> {
  const data = await eventService.getPublicEvents(req.query as Record<string, string>);
  res.json({ success: true, data });
}

export async function addCoPlanner(req: AuthRequest, res: Response): Promise<void> {
  await eventService.addCoPlanner(req.params.id, req.user.userId, req.body);
  res.json({ success: true });
}

export async function removeCoPlanner(req: AuthRequest, res: Response): Promise<void> {
  await eventService.removeCoPlanner(req.params.id, req.user.userId, req.params.userId);
  res.json({ success: true });
}

export async function addRunsheetItem(req: AuthRequest, res: Response): Promise<void> {
  const data = await eventService.addRunsheetItem(req.params.id, req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function toggleRunsheetItem(req: AuthRequest, res: Response): Promise<void> {
  const data = await eventService.toggleRunsheetItem(req.params.itemId, req.user.userId);
  res.json({ success: true, data });
}
` },
  { p: "src/modules/events/event.routes.ts", c: `import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createEventSchema, updateEventSchema, addCoPlannerSchema, addRunsheetItemSchema } from './event.schemas';
import * as eventController from './event.controller';

const router = Router();

// Public
router.get('/public',                   eventController.getPublicEvents);
router.get('/slug/:slug',               eventController.getEventBySlug);

// Authenticated
router.get('/my',                       authenticate, eventController.getMyEvents as any);
router.post('/',                        authenticate, validate(createEventSchema),    eventController.createEvent as any);
router.get('/:id',                      authenticate, eventController.getEventById as any);
router.patch('/:id',                    authenticate, validate(updateEventSchema),    eventController.updateEvent as any);
router.delete('/:id',                   authenticate, eventController.deleteEvent as any);
router.post('/:id/co-planners',         authenticate, validate(addCoPlannerSchema),   eventController.addCoPlanner as any);
router.delete('/:id/co-planners/:userId', authenticate,                               eventController.removeCoPlanner as any);
router.post('/:id/runsheet',            authenticate, validate(addRunsheetItemSchema), eventController.addRunsheetItem as any);
router.patch('/runsheet/:itemId/toggle',authenticate, eventController.toggleRunsheetItem as any);

export default router;
` },
  { p: "src/modules/events/event.schemas.ts", c: `import { z } from 'zod';

export const createEventSchema = z.object({
  name:          z.string().min(3).max(200),
  type:          z.enum(['wedding','conference','birthday','product_launch','concert','funeral_reception','baby_shower','graduation','award_ceremony','religious_gathering','custom']),
  description:   z.string().optional(),
  startTime:     z.string().datetime(),
  endTime:       z.string().datetime(),
  visibility:    z.enum(['public','private','unlisted']).default('private'),
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
` },
  { p: "src/modules/events/event.service.ts", c: `import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError, ForbiddenError } from '../../middleware/errorHandler';
import { generateSlug, buildSetClause, paginate } from '../../utils/helpers';
import { CreateEventDto, UpdateEventDto, AddCoPlannerDto, AddRunsheetItemDto } from './event.schemas';

async function assertCanEdit(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(\`SELECT planner_id FROM events WHERE id = $1\`, [eventId]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id === userId) return;
  const co = await queryOne<{ permission: string }>(
    \`SELECT permission FROM event_co_planners WHERE event_id = $1 AND user_id = $2\`, [eventId, userId]
  );
  if (!co || co.permission === 'viewer') throw new ForbiddenError();
}

export async function createEvent(plannerId: string, dto: CreateEventDto) {
  const slug = generateSlug(dto.name);
  const [event] = await query(
    \`INSERT INTO events (planner_id,venue_id,name,type,description,start_time,end_time,
       visibility,max_guests,rsvp_deadline,cover_image_url,slug,seating_mode,score_influence)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *\`,
    [plannerId,dto.venueId??null,dto.name,dto.type,dto.description??null,dto.startTime,dto.endTime,
     dto.visibility,dto.maxGuests,dto.rsvpDeadline??null,dto.coverImageUrl??null,slug,dto.seatingMode,dto.scoreInfluence]
  );
  return event;
}

export async function getEventById(id: string, requesterId?: string) {
  const event = await queryOne(
    \`SELECT e.*, p.display_name AS planner_name, v.name AS venue_name, v.city AS venue_city
     FROM events e
     JOIN user_profiles p ON p.user_id = e.planner_id
     LEFT JOIN venues v ON v.id = e.venue_id
     WHERE e.id = $1\`,
    [id]
  );
  if (!event) throw new NotFoundError('Event');
  if ((event as any).visibility === 'private' && (event as any).planner_id !== requesterId) {
    const isCo = await queryOne(\`SELECT 1 FROM event_co_planners WHERE event_id = $1 AND user_id = $2\`, [id, requesterId]);
    if (!isCo) throw new ForbiddenError('This event is private');
  }
  const runsheet = await query(\`SELECT * FROM event_runsheet WHERE event_id = $1 ORDER BY sort_order\`, [id]);
  return { ...event, runsheet };
}

export async function getEventBySlug(slug: string) {
  const event = await queryOne(
    \`SELECT e.*, p.display_name AS planner_name, v.name AS venue_name
     FROM events e
     JOIN user_profiles p ON p.user_id = e.planner_id
     LEFT JOIN venues v ON v.id = e.venue_id
     WHERE e.slug = $1 AND e.visibility = 'public'\`,
    [slug]
  );
  if (!event) throw new NotFoundError('Event');
  return event;
}

export async function updateEvent(id: string, requesterId: string, dto: UpdateEventDto) {
  await assertCanEdit(id, requesterId);
  const fields: Record<string, unknown> = { updated_at: new Date() };
  if (dto.name           !== undefined) fields.name            = dto.name;
  if (dto.description    !== undefined) fields.description     = dto.description;
  if (dto.startTime      !== undefined) fields.start_time      = dto.startTime;
  if (dto.endTime        !== undefined) fields.end_time        = dto.endTime;
  if (dto.visibility     !== undefined) fields.visibility      = dto.visibility;
  if (dto.maxGuests      !== undefined) fields.max_guests      = dto.maxGuests;
  if (dto.status         !== undefined) fields.status          = dto.status;
  if (dto.rsvpDeadline   !== undefined) fields.rsvp_deadline   = dto.rsvpDeadline;
  if (dto.coverImageUrl  !== undefined) fields.cover_image_url = dto.coverImageUrl;
  if (dto.seatingMode    !== undefined) fields.seating_mode    = dto.seatingMode;
  if (dto.scoreInfluence !== undefined) fields.score_influence = dto.scoreInfluence;
  const { clause, values } = buildSetClause(fields);
  const [updated] = await query(\`UPDATE events SET \${clause} WHERE id = $\${values.length+1} RETURNING *\`, [...values, id]);
  return updated;
}

export async function deleteEvent(id: string, requesterId: string) {
  const event = await queryOne<{ planner_id: string }>(\`SELECT planner_id FROM events WHERE id = $1\`, [id]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== requesterId) throw new ForbiddenError();
  await query(\`DELETE FROM events WHERE id = $1\`, [id]);
}

export async function getMyEvents(plannerId: string) {
  return query(
    \`SELECT e.*,
       (SELECT COUNT(*) FROM guests g WHERE g.event_id = e.id) AS guest_count,
       (SELECT COUNT(*) FROM guests g WHERE g.event_id = e.id AND g.rsvp_status = 'confirmed') AS confirmed_count
     FROM events e WHERE e.planner_id = $1 ORDER BY e.start_time DESC\`,
    [plannerId]
  );
}

export async function getPublicEvents(params: Record<string, string>) {
  const { page, limit, offset } = paginate(Number(params.page), Number(params.limit));
  const conditions = [\`e.visibility='public'\`, \`e.status='published'\`, \`e.start_time > NOW()\`];
  const values: unknown[] = [];
  let i = 1;
  if (params.type) { conditions.push(\`e.type = $\${i++}\`); values.push(params.type); }
  if (params.city) { conditions.push(\`LOWER(v.city) LIKE $\${i++}\`); values.push(\`%\${params.city.toLowerCase()}%\`); }
  const where = conditions.join(' AND ');
  return query(
    \`SELECT e.id,e.name,e.type,e.slug,e.start_time,e.cover_image_url,v.name AS venue_name,v.city AS venue_city
     FROM events e LEFT JOIN venues v ON v.id = e.venue_id
     WHERE \${where} ORDER BY e.start_time ASC LIMIT $\${i++} OFFSET $\${i++}\`,
    [...values, limit, offset]
  );
}

export async function addCoPlanner(eventId: string, requesterId: string, dto: AddCoPlannerDto) {
  const event = await queryOne<{ planner_id: string }>(\`SELECT planner_id FROM events WHERE id = $1\`, [eventId]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== requesterId) throw new ForbiddenError();
  const invitee = await queryOne<{ id: string }>(\`SELECT id FROM users WHERE email = $1\`, [dto.email]);
  if (!invitee) throw new NotFoundError('User with that email');
  await query(
    \`INSERT INTO event_co_planners (event_id,user_id,permission) VALUES ($1,$2,$3)
     ON CONFLICT (event_id,user_id) DO UPDATE SET permission = EXCLUDED.permission\`,
    [eventId, invitee.id, dto.permission]
  );
}

export async function removeCoPlanner(eventId: string, requesterId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(\`SELECT planner_id FROM events WHERE id = $1\`, [eventId]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== requesterId) throw new ForbiddenError();
  await query(\`DELETE FROM event_co_planners WHERE event_id = $1 AND user_id = $2\`, [eventId, userId]);
}

export async function addRunsheetItem(eventId: string, requesterId: string, dto: AddRunsheetItemDto) {
  await assertCanEdit(eventId, requesterId);
  const [item] = await query(
    \`INSERT INTO event_runsheet (event_id,title,description,scheduled_at,assigned_to,sort_order)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *\`,
    [eventId, dto.title, dto.description, dto.scheduledAt, dto.assignedTo, dto.sortOrder]
  );
  return item;
}

export async function toggleRunsheetItem(itemId: string, requesterId: string) {
  const item = await queryOne<{ event_id: string }>(\`SELECT event_id FROM event_runsheet WHERE id = $1\`, [itemId]);
  if (!item) throw new NotFoundError('Runsheet item');
  await assertCanEdit(item.event_id, requesterId);
  const [updated] = await query(
    \`UPDATE event_runsheet SET is_completed = NOT is_completed WHERE id = $1 RETURNING *\`, [itemId]
  );
  return updated;
}
` },
  { p: "src/modules/guests/guest.controller.ts", c: `import { Request, Response } from 'express';
import { AuthRequest } from '../../types';
import * as guestService from './guest.service';

export async function addGuest(req: AuthRequest, res: Response): Promise<void> {
  const data = await guestService.addGuest(req.params.eventId, req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function bulkAddGuests(req: AuthRequest, res: Response): Promise<void> {
  const data = await guestService.bulkAddGuests(req.params.eventId, req.user.userId, req.body.guests);
  res.status(201).json({ success: true, data });
}

export async function getGuests(req: AuthRequest, res: Response): Promise<void> {
  const data = await guestService.getGuests(req.params.eventId, req.user.userId, req.query as Record<string, string>);
  res.json({ success: true, data });
}

export async function updateGuest(req: AuthRequest, res: Response): Promise<void> {
  const data = await guestService.updateGuest(req.params.guestId, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function removeGuest(req: AuthRequest, res: Response): Promise<void> {
  await guestService.removeGuest(req.params.guestId, req.user.userId);
  res.json({ success: true });
}

export async function checkInGuest(req: AuthRequest, res: Response): Promise<void> {
  const data = await guestService.checkInGuest(req.params.eventId, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function getCheckinStats(req: AuthRequest, res: Response): Promise<void> {
  const data = await guestService.getCheckinStats(req.params.eventId, req.user.userId);
  res.json({ success: true, data });
}

export async function getGuestByToken(req: Request, res: Response): Promise<void> {
  const data = await guestService.getGuestByToken(req.params.token);
  res.json({ success: true, data });
}
` },
  { p: "src/modules/guests/guest.routes.ts", c: `import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { addGuestSchema, bulkAddGuestsSchema, updateGuestSchema, checkInSchema } from './guest.schemas';
import * as guestController from './guest.controller';

const router = Router();

// Public — guest views their own invite by token
router.get('/invite/:token',                      guestController.getGuestByToken);

// Event guest management
router.get   ('/:eventId',                        authenticate, guestController.getGuests as any);
router.post  ('/:eventId',                        authenticate, validate(addGuestSchema),       guestController.addGuest as any);
router.post  ('/:eventId/bulk',                   authenticate, validate(bulkAddGuestsSchema),  guestController.bulkAddGuests as any);
router.patch ('/:eventId/:guestId',               authenticate, validate(updateGuestSchema),    guestController.updateGuest as any);
router.delete('/:eventId/:guestId',               authenticate, guestController.removeGuest as any);

// Check-in
router.post  ('/:eventId/checkin',                authenticate, validate(checkInSchema),        guestController.checkInGuest as any);
router.get   ('/:eventId/checkin/stats',          authenticate, guestController.getCheckinStats as any);

export default router;
` },
  { p: "src/modules/guests/guest.schemas.ts", c: `import { z } from 'zod';

export const addGuestSchema = z.object({
  name:             z.string().min(2).max(200),
  email:            z.string().email().optional(),
  phone:            z.string().max(20).optional(),
  category:         z.enum(['vip','dignitary','family','general','press','vendor_staff']).default('general'),
  notes:            z.string().optional(),
  dietaryReq:       z.string().optional(),
  accessibilityReq: z.string().optional(),
});

export const bulkAddGuestsSchema = z.object({
  guests: z.array(addGuestSchema).min(1).max(1000),
});

export const updateGuestSchema = addGuestSchema.partial().extend({
  rsvpStatus: z.enum(['pending','confirmed','declined','tentative','waitlisted']).optional(),
});

export const checkInSchema = z.object({
  qrCode:  z.string().optional(),
  guestId: z.string().uuid().optional(),
});

export type AddGuestDto    = z.infer<typeof addGuestSchema>;
export type UpdateGuestDto = z.infer<typeof updateGuestSchema>;
export type CheckInDto     = z.infer<typeof checkInSchema>;
` },
  { p: "src/modules/guests/guest.service.ts", c: `import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError, ForbiddenError, AppError, ConflictError } from '../../middleware/errorHandler';
import { buildSetClause, generateToken, paginate } from '../../utils/helpers';
import { generateQRCode } from '../../utils/qrcode';
import { AddGuestDto, UpdateGuestDto, CheckInDto } from './guest.schemas';
import { Server as SocketServer } from 'socket.io';

async function assertCanManage(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(\`SELECT planner_id FROM events WHERE id = $1\`, [eventId]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id === userId) return;
  const co = await queryOne(
    \`SELECT 1 FROM event_co_planners WHERE event_id = $1 AND user_id = $2 AND permission IN ('editor','admin')\`,
    [eventId, userId]
  );
  if (!co) throw new ForbiddenError('You do not have access to manage this event');
}

export async function addGuest(eventId: string, requesterId: string, dto: AddGuestDto) {
  await assertCanManage(eventId, requesterId);
  const event = await queryOne<{ max_guests: number }>(\`SELECT max_guests FROM events WHERE id = $1\`, [eventId]);
  const [{ count }] = await query<any>(
    \`SELECT COUNT(*) FROM guests WHERE event_id = $1 AND rsvp_status != 'declined'\`, [eventId]
  );
  const rsvpStatus = Number(count) >= (event?.max_guests ?? 0) ? 'waitlisted' : 'pending';
  const qrData = \`eventshere:checkin:\${generateToken(16)}\`;
  const qrCode = await generateQRCode(qrData);
  const [guest] = await query(
    \`INSERT INTO guests (event_id,name,email,phone,category,rsvp_status,notes,dietary_req,accessibility_req,qr_code)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *\`,
    [eventId,dto.name,dto.email,dto.phone,dto.category,rsvpStatus,dto.notes,dto.dietaryReq,dto.accessibilityReq,qrCode]
  );
  return guest;
}

export async function bulkAddGuests(eventId: string, requesterId: string, guests: AddGuestDto[]) {
  await assertCanManage(eventId, requesterId);
  const results = await Promise.allSettled(guests.map(g => addGuest(eventId, requesterId, g)));
  return {
    succeeded: results.filter(r => r.status === 'fulfilled').length,
    failed:    results.filter(r => r.status === 'rejected').length,
    total:     guests.length,
  };
}

export async function getGuests(eventId: string, requesterId: string, filters: Record<string, string>) {
  await assertCanManage(eventId, requesterId);
  const { page, limit, offset } = paginate(Number(filters.page), Number(filters.limit));
  const conditions = [\`g.event_id = $1\`];
  const values: unknown[] = [eventId];
  let i = 2;
  if (filters.category)   { conditions.push(\`g.category = $\${i++}\`);    values.push(filters.category); }
  if (filters.rsvpStatus) { conditions.push(\`g.rsvp_status = $\${i++}\`); values.push(filters.rsvpStatus); }
  const where = conditions.join(' AND ');
  const [{ count }] = await query<any>(\`SELECT COUNT(*) FROM guests g WHERE \${where}\`, values);
  const rows = await query(
    \`SELECT g.*, sa.seat_label, sa.zone_name
     FROM guests g LEFT JOIN seat_assignments sa ON sa.guest_id = g.id AND sa.event_id = $1
     WHERE \${where} ORDER BY g.category, g.name LIMIT $\${i++} OFFSET $\${i++}\`,
    [...values, limit, offset]
  );
  return { data: rows, total: Number(count), page, limit };
}

export async function updateGuest(guestId: string, requesterId: string, dto: UpdateGuestDto) {
  const guest = await queryOne<{ event_id: string }>(\`SELECT event_id FROM guests WHERE id = $1\`, [guestId]);
  if (!guest) throw new NotFoundError('Guest');
  await assertCanManage(guest.event_id, requesterId);
  const fields: Record<string, unknown> = {};
  if (dto.name             !== undefined) fields.name              = dto.name;
  if (dto.email            !== undefined) fields.email             = dto.email;
  if (dto.phone            !== undefined) fields.phone             = dto.phone;
  if (dto.category         !== undefined) fields.category          = dto.category;
  if (dto.rsvpStatus       !== undefined) fields.rsvp_status       = dto.rsvpStatus;
  if (dto.notes            !== undefined) fields.notes             = dto.notes;
  if (dto.dietaryReq       !== undefined) fields.dietary_req       = dto.dietaryReq;
  if (dto.accessibilityReq !== undefined) fields.accessibility_req = dto.accessibilityReq;
  const { clause, values } = buildSetClause(fields);
  const [updated] = await query(
    \`UPDATE guests SET \${clause} WHERE id = $\${values.length+1} RETURNING *\`, [...values, guestId]
  );
  return updated;
}

export async function removeGuest(guestId: string, requesterId: string) {
  const guest = await queryOne<{ event_id: string }>(\`SELECT event_id FROM guests WHERE id = $1\`, [guestId]);
  if (!guest) throw new NotFoundError('Guest');
  await assertCanManage(guest.event_id, requesterId);
  await query(\`DELETE FROM guests WHERE id = $1\`, [guestId]);
}

export async function checkInGuest(eventId: string, requesterId: string, dto: CheckInDto, io?: SocketServer) {
  await assertCanManage(eventId, requesterId);
  let guest: any;
  if (dto.qrCode)       guest = await queryOne(\`SELECT * FROM guests WHERE qr_code = $1 AND event_id = $2\`, [dto.qrCode, eventId]);
  else if (dto.guestId) guest = await queryOne(\`SELECT * FROM guests WHERE id = $1 AND event_id = $2\`, [dto.guestId, eventId]);
  if (!guest) throw new NotFoundError('Guest');
  if (guest.checked_in) throw new ConflictError('Guest already checked in');
  const [updated] = await query(
    \`UPDATE guests SET checked_in = TRUE, checked_in_at = NOW() WHERE id = $1 RETURNING *\`, [guest.id]
  );
  if (io) {
    io.to(\`event:\${eventId}\`).emit('checkin:update', {
      guestId: guest.id, guestName: guest.name,
      checkedInAt: updated.checked_in_at,
    });
  }
  return updated;
}

export async function getCheckinStats(eventId: string, requesterId: string) {
  await assertCanManage(eventId, requesterId);
  const [stats] = await query(
    \`SELECT
       COUNT(*) FILTER (WHERE rsvp_status = 'confirmed') AS confirmed,
       COUNT(*) FILTER (WHERE checked_in = TRUE)         AS checked_in,
       COUNT(*) FILTER (WHERE rsvp_status = 'confirmed' AND checked_in = FALSE) AS not_arrived,
       COUNT(*) AS total
     FROM guests WHERE event_id = $1\`,
    [eventId]
  );
  return stats;
}

export async function getGuestByToken(token: string) {
  const inv = await queryOne(
    \`SELECT i.token, g.name, g.email, g.category, g.rsvp_status,
            e.name AS event_name, e.start_time, e.end_time,
            v.name AS venue_name, v.address AS venue_address,
            sa.seat_label, sa.zone_name
     FROM invitations i
     JOIN guests g  ON g.id  = i.guest_id
     JOIN events e  ON e.id  = i.event_id
     LEFT JOIN venues v ON v.id = e.venue_id
     LEFT JOIN seat_assignments sa ON sa.guest_id = g.id AND sa.event_id = e.id
     WHERE i.token = $1\`,
    [token]
  );
  if (!inv) throw new NotFoundError('Invitation');
  return inv;
}
` },
  { p: "src/modules/invitations/invitation.controller.ts", c: `import { Request, Response } from 'express';
import { AuthRequest } from '../../types';
import * as invitationService from './invitation.service';

export async function sendInvitations(req: AuthRequest, res: Response): Promise<void> {
  const data = await invitationService.sendInvitations(req.params.eventId, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function handleRsvp(req: Request, res: Response): Promise<void> {
  await invitationService.handleRsvp(req.body);
  res.json({ success: true, message: \`RSVP recorded as \${req.body.status}\` });
}

export async function sendSeatNotifications(req: AuthRequest, res: Response): Promise<void> {
  const data = await invitationService.sendSeatNotifications(req.params.eventId, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function getInvitationStats(req: AuthRequest, res: Response): Promise<void> {
  const data = await invitationService.getInvitationStats(req.params.eventId, req.user.userId);
  res.json({ success: true, data });
}
` },
  { p: "src/modules/invitations/invitation.routes.ts", c: `import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { sendInvitationsSchema, rsvpRespondSchema, sendSeatNotificationsSchema } from './invitation.schemas';
import * as invitationController from './invitation.controller';

const router = Router();

// Public — guest submits their RSVP
router.post('/rsvp',                          validate(rsvpRespondSchema),           invitationController.handleRsvp);

// Planner actions
router.post ('/:eventId/send',                authenticate, validate(sendInvitationsSchema),       invitationController.sendInvitations as any);
router.post ('/:eventId/send-seats',          authenticate, validate(sendSeatNotificationsSchema), invitationController.sendSeatNotifications as any);
router.get  ('/:eventId/stats',               authenticate, invitationController.getInvitationStats as any);

export default router;
` },
  { p: "src/modules/invitations/invitation.schemas.ts", c: `import { z } from 'zod';

export const sendInvitationsSchema = z.object({
  guestIds: z.array(z.string().uuid()).min(1),
  channel:  z.enum(['email','sms','whatsapp','in_app']).default('email'),
});

export const rsvpRespondSchema = z.object({
  token:            z.string().min(1),
  status:           z.enum(['confirmed','declined','tentative']),
  dietaryReq:       z.string().optional(),
  accessibilityReq: z.string().optional(),
});

export const sendSeatNotificationsSchema = z.object({
  guestIds: z.array(z.string().uuid()).optional(),
});

export type SendInvitationsDto      = z.infer<typeof sendInvitationsSchema>;
export type RsvpRespondDto          = z.infer<typeof rsvpRespondSchema>;
export type SendSeatNotificationsDto= z.infer<typeof sendSeatNotificationsSchema>;
` },
  { p: "src/modules/invitations/invitation.service.ts", c: `import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError, ForbiddenError } from '../../middleware/errorHandler';
import { generateToken } from '../../utils/helpers';
import { generateQRCode } from '../../utils/qrcode';
import { sendEmail, invitationTemplate, seatAssignmentTemplate } from '../../utils/email';
import { env } from '../../config/env';
import { SendInvitationsDto, RsvpRespondDto, SendSeatNotificationsDto } from './invitation.schemas';

async function assertPlannerOwns(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(\`SELECT planner_id FROM events WHERE id=$1\`, [eventId]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== userId) throw new ForbiddenError();
}

export async function sendInvitations(eventId: string, requesterId: string, dto: SendInvitationsDto) {
  await assertPlannerOwns(eventId, requesterId);

  const event = await queryOne<{ name: string; start_time: Date; rsvp_deadline: Date }>(
    \`SELECT name, start_time, rsvp_deadline FROM events WHERE id=$1\`, [eventId]
  );
  if (!event) throw new NotFoundError('Event');

  const venue = await queryOne<{ name: string }>(
    \`SELECT v.name FROM venues v JOIN events e ON e.venue_id=v.id WHERE e.id=$1\`, [eventId]
  );

  const results = { sent: 0, failed: 0 };

  for (const guestId of dto.guestIds) {
    try {
      const guest = await queryOne<{ id: string; name: string; email: string }>(
        \`SELECT id,name,email FROM guests WHERE id=$1 AND event_id=$2\`, [guestId, eventId]
      );
      if (!guest?.email) continue;

      const token = generateToken();
      await query(
        \`INSERT INTO invitations (event_id,guest_id,token,channel) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING\`,
        [eventId, guestId, token, dto.channel]
      );

      const rsvpUrl = \`\${env.CLIENT_URL}/invite/\${token}\`;
      const tmpl = invitationTemplate({
        guestName:    guest.name,
        eventName:    event.name,
        eventDate:    new Date(event.start_time).toLocaleDateString('en-NG', { dateStyle: 'full' }),
        venueName:    venue?.name ?? 'TBD',
        rsvpUrl,
        rsvpDeadline: event.rsvp_deadline
          ? new Date(event.rsvp_deadline).toLocaleDateString('en-NG', { dateStyle: 'full' })
          : 'ASAP',
      });

      await sendEmail({ to: guest.email, ...tmpl });
      await query(\`UPDATE invitations SET sent_at=NOW() WHERE token=$1\`, [token]);
      results.sent++;
    } catch {
      results.failed++;
    }
  }

  return results;
}

export async function handleRsvp(dto: RsvpRespondDto) {
  const inv = await queryOne<{ id: string; guest_id: string }>(
    \`SELECT id, guest_id FROM invitations WHERE token=$1\`, [dto.token]
  );
  if (!inv) throw new NotFoundError('Invitation');

  await query(\`UPDATE invitations SET status='responded', responded_at=NOW() WHERE id=$1\`, [inv.id]);
  await query(\`UPDATE guests SET rsvp_status=$1 WHERE id=$2\`, [dto.status, inv.guest_id]);

  if (dto.dietaryReq)       await query(\`UPDATE guests SET dietary_req=$1 WHERE id=$2\`,        [dto.dietaryReq, inv.guest_id]);
  if (dto.accessibilityReq) await query(\`UPDATE guests SET accessibility_req=$1 WHERE id=$2\`,  [dto.accessibilityReq, inv.guest_id]);
}

export async function sendSeatNotifications(eventId: string, requesterId: string, dto: SendSeatNotificationsDto) {
  await assertPlannerOwns(eventId, requesterId);

  const event = await queryOne<{ name: string; start_time: Date }>(
    \`SELECT name, start_time FROM events WHERE id=$1\`, [eventId]
  );
  if (!event) throw new NotFoundError('Event');

  const extraFilter = dto.guestIds?.length ? \`AND g.id = ANY($2::uuid[])\` : '';
  const params: unknown[] = dto.guestIds?.length ? [eventId, dto.guestIds] : [eventId];

  const guests = await query(
    \`SELECT g.id,g.name,g.email,sa.seat_label,sa.zone_name,i.token
     FROM guests g
     JOIN seat_assignments sa ON sa.guest_id=g.id AND sa.event_id=$1
     LEFT JOIN invitations i ON i.guest_id=g.id AND i.event_id=$1
     WHERE g.event_id=$1 AND g.email IS NOT NULL \${extraFilter}\`,
    params
  );

  const results = { sent: 0, failed: 0 };
  for (const guest of guests) {
    try {
      const token = guest.token ?? generateToken();
      const seatFinderUrl = \`\${env.CLIENT_URL}/seat/\${token}\`;
      const qrCode = await generateQRCode(seatFinderUrl);
      const tmpl = seatAssignmentTemplate({
        guestName: guest.name, eventName: event.name,
        eventDate: new Date(event.start_time).toLocaleDateString('en-NG', { dateStyle: 'full' }),
        seatLabel: guest.seat_label, zoneName: guest.zone_name,
        seatFinderUrl, qrCodeDataUrl: qrCode,
      });
      await sendEmail({ to: guest.email, ...tmpl });
      results.sent++;
    } catch {
      results.failed++;
    }
  }
  return results;
}

export async function getInvitationStats(eventId: string, requesterId: string) {
  await assertPlannerOwns(eventId, requesterId);
  const [stats] = await query(
    \`SELECT
       COUNT(*) FILTER (WHERE status='sent')      AS sent,
       COUNT(*) FILTER (WHERE status='viewed')    AS viewed,
       COUNT(*) FILTER (WHERE status='responded') AS responded,
       COUNT(*) AS total
     FROM invitations WHERE event_id=$1\`,
    [eventId]
  );
  return stats;
}
` },
  { p: "src/modules/layouts/layout.controller.ts", c: `import { Request, Response } from 'express';
import { AuthRequest } from '../../types';
import * as layoutService from './layout.service';

export async function getLayouts(req: AuthRequest, res: Response): Promise<void> {
  const data = await layoutService.getLayouts(req.params.eventId, req.user.userId);
  res.json({ success: true, data });
}

export async function getActiveLayout(req: Request, res: Response): Promise<void> {
  const data = await layoutService.getActiveLayout(req.params.eventId);
  res.json({ success: true, data });
}

export async function getLayoutById(req: AuthRequest, res: Response): Promise<void> {
  const data = await layoutService.getLayoutById(req.params.eventId, req.params.layoutId, req.user.userId);
  res.json({ success: true, data });
}

export async function saveLayout(req: AuthRequest, res: Response): Promise<void> {
  const data = await layoutService.saveLayout(req.params.eventId, req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function activateLayout(req: AuthRequest, res: Response): Promise<void> {
  const data = await layoutService.activateLayout(req.params.eventId, req.params.layoutId, req.user.userId);
  res.json({ success: true, data });
}

export async function deleteLayout(req: AuthRequest, res: Response): Promise<void> {
  await layoutService.deleteLayout(req.params.eventId, req.params.layoutId, req.user.userId);
  res.json({ success: true });
}

export async function getSeats(req: Request, res: Response): Promise<void> {
  const data = await layoutService.getSeats(req.params.eventId);
  res.json({ success: true, data });
}
` },
  { p: "src/modules/layouts/layout.routes.ts", c: `import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { saveLayoutSchema } from './layout.schemas';
import * as layoutController from './layout.controller';

const router = Router();

router.get   ('/:eventId',                    authenticate, layoutController.getLayouts as any);
router.get   ('/:eventId/active',             authenticate, layoutController.getActiveLayout);
router.get   ('/:eventId/seats',              authenticate, layoutController.getSeats);
router.get   ('/:eventId/:layoutId',          authenticate, layoutController.getLayoutById as any);
router.post  ('/:eventId',                    authenticate, validate(saveLayoutSchema), layoutController.saveLayout as any);
router.patch ('/:eventId/:layoutId/activate', authenticate, layoutController.activateLayout as any);
router.delete('/:eventId/:layoutId',          authenticate, layoutController.deleteLayout as any);

export default router;
` },
  { p: "src/modules/layouts/layout.schemas.ts", c: `import { z } from 'zod';

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
` },
  { p: "src/modules/layouts/layout.service.ts", c: `import { Layout } from '../../db/mongo/layout.model';
import { queryOne } from '../../db/postgres/client';
import { NotFoundError, ForbiddenError, AppError } from '../../middleware/errorHandler';
import { SaveLayoutDto } from './layout.schemas';

async function assertCanEdit(eventId: string, userId: string) {
  const event = await queryOne<{ planner_id: string }>(\`SELECT planner_id FROM events WHERE id = $1\`, [eventId]);
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id === userId) return;
  const co = await queryOne(
    \`SELECT 1 FROM event_co_planners WHERE event_id = $1 AND user_id = $2\`, [eventId, userId]
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
` },
  { p: "src/modules/notifications/notification.controller.ts", c: `import { Response } from 'express';
import { AuthRequest } from '../../types';
import * as notificationService from './notification.service';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  const data = await notificationService.getNotifications(req.user.userId, req.query as Record<string, string>);
  res.json({ success: true, data });
}

export async function getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
  const count = await notificationService.getUnreadCount(req.user.userId);
  res.json({ success: true, data: { count } });
}

export async function markRead(req: AuthRequest, res: Response): Promise<void> {
  await notificationService.markRead(req.params.id, req.user.userId);
  res.json({ success: true });
}

export async function markAllRead(req: AuthRequest, res: Response): Promise<void> {
  await notificationService.markAllRead(req.user.userId);
  res.json({ success: true });
}
` },
  { p: "src/modules/notifications/notification.routes.ts", c: `import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as notificationController from './notification.controller';

const router = Router();

router.get   ('/',            authenticate, notificationController.getNotifications as any);
router.get   ('/unread-count',authenticate, notificationController.getUnreadCount as any);
router.patch ('/:id/read',    authenticate, notificationController.markRead as any);
router.patch ('/read-all',    authenticate, notificationController.markAllRead as any);

export default router;
` },
  { p: "src/modules/notifications/notification.service.ts", c: `import { query, queryOne } from '../../db/postgres/client';
import { paginate } from '../../utils/helpers';

export async function getNotifications(userId: string, params: Record<string, string>) {
  const { page, limit, offset } = paginate(Number(params.page), Number(params.limit));
  const rows = await query(
    \`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3\`,
    [userId, limit, offset]
  );
  const [{ count }] = await query<any>(\`SELECT COUNT(*) FROM notifications WHERE user_id = $1\`, [userId]);
  return { data: rows, total: Number(count), page, limit };
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [{ count }] = await query<any>(
    \`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL\`, [userId]
  );
  return Number(count);
}

export async function markRead(notificationId: string, userId: string): Promise<void> {
  await query(
    \`UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2\`, [notificationId, userId]
  );
}

export async function markAllRead(userId: string): Promise<void> {
  await query(\`UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL\`, [userId]);
}

// Helper called by other services to create a notification
export async function createNotification(p: {
  userId: string; type: string; title: string; body: string;
  data?: Record<string, unknown>; channel?: string;
}): Promise<void> {
  await query(
    \`INSERT INTO notifications (user_id,type,title,body,data,channel) VALUES ($1,$2,$3,$4,$5,$6)\`,
    [p.userId, p.type, p.title, p.body, JSON.stringify(p.data ?? {}), p.channel ?? 'in_app']
  );
}
` },
  { p: "src/modules/payments/payment.controller.ts", c: `import { Request, Response } from 'express';
import { AuthRequest } from '../../types';
import * as paymentService from './payment.service';

export async function initializePayment(req: AuthRequest, res: Response): Promise<void> {
  const data = await paymentService.initializePayment(req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['x-paystack-signature'] as string;
  await paymentService.handleWebhook(signature, JSON.stringify(req.body), req.body);
  res.sendStatus(200);
}

export async function verifyPayment(req: Request, res: Response): Promise<void> {
  const data = await paymentService.verifyPayment(req.params.reference);
  res.json({ success: true, data });
}
` },
  { p: "src/modules/payments/payment.routes.ts", c: `import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { initPaymentSchema } from './payment.schemas';
import * as paymentController from './payment.controller';

const router = Router();

router.post('/initialize',         authenticate, validate(initPaymentSchema), paymentController.initializePayment as any);
router.post('/webhook',            paymentController.handleWebhook); // No auth — Paystack calls this directly
router.get ('/verify/:reference',  authenticate, paymentController.verifyPayment);

export default router;
` },
  { p: "src/modules/payments/payment.schemas.ts", c: `import { z } from 'zod';

export const initPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  email:     z.string().email(),
});

export type InitPaymentDto = z.infer<typeof initPaymentSchema>;
` },
  { p: "src/modules/payments/payment.service.ts", c: `import axios from 'axios';
import crypto from 'crypto';
import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError, ForbiddenError, AppError, ConflictError } from '../../middleware/errorHandler';
import { env } from '../../config/env';
import { InitPaymentDto } from './payment.schemas';

const BASE = 'https://api.paystack.co';
const headers = () => ({ Authorization: \`Bearer \${env.PAYSTACK_SECRET_KEY}\`, 'Content-Type': 'application/json' });

export async function initializePayment(userId: string, dto: InitPaymentDto) {
  const booking = await queryOne<{ id: string; planner_id: string; total_amount: number; currency: string; payment_status: string }>(
    \`SELECT id,planner_id,total_amount,currency,payment_status FROM bookings WHERE id = $1\`, [dto.bookingId]
  );
  if (!booking) throw new NotFoundError('Booking');
  if (booking.planner_id !== userId) throw new ForbiddenError();
  if (booking.payment_status === 'paid') throw new ConflictError('Booking already paid');

  const { data } = await axios.post(
    \`\${BASE}/transaction/initialize\`,
    { email: dto.email, amount: Math.round(booking.total_amount * 100), currency: booking.currency || 'NGN',
      metadata: { bookingId: dto.bookingId, userId } },
    { headers: headers() }
  );
  await query(\`UPDATE bookings SET paystack_ref = $1 WHERE id = $2\`, [data.data.reference, dto.bookingId]);
  return { authorizationUrl: data.data.authorization_url, reference: data.data.reference };
}

export async function handleWebhook(signature: string, rawBody: string, payload: any): Promise<void> {
  const expected = crypto.createHmac('sha512', env.PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
  if (expected !== signature) throw new AppError('Invalid webhook signature', 401);

  if (payload.event === 'charge.success') {
    const booking = await queryOne<{ id: string }>(
      \`SELECT id FROM bookings WHERE paystack_ref = $1\`, [payload.data.reference]
    );
    if (booking) {
      await query(
        \`UPDATE bookings SET payment_status='paid', status='confirmed', updated_at=NOW() WHERE id=$1\`, [booking.id]
      );
    }
  }
}

export async function verifyPayment(reference: string) {
  const { data } = await axios.get(\`\${BASE}/transaction/verify/\${reference}\`, { headers: headers() });
  if (data.data.status === 'success') {
    const bookingId = data.data.metadata?.bookingId;
    if (bookingId) {
      await query(
        \`UPDATE bookings SET payment_status='paid', status='confirmed', updated_at=NOW() WHERE id=$1\`, [bookingId]
      );
    }
  }
  return { status: data.data.status, amount: data.data.amount / 100 };
}
` },
  { p: "src/modules/ratings/rating.controller.ts", c: `import { Request, Response } from 'express';
import { AuthRequest } from '../../types';
import * as ratingService from './rating.service';

export async function submitRating(req: AuthRequest, res: Response): Promise<void> {
  const data = await ratingService.submitRating(req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function getMyScore(req: AuthRequest, res: Response): Promise<void> {
  const data = await ratingService.getMyScore(req.user.userId);
  res.json({ success: true, data });
}

export async function flagRating(req: Request, res: Response): Promise<void> {
  await ratingService.flagRating(req.params.id);
  res.json({ success: true, message: 'Rating flagged for review' });
}
` },
  { p: "src/modules/ratings/rating.routes.ts", c: `import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { submitRatingSchema } from './rating.schemas';
import * as ratingController from './rating.controller';

const router = Router();

router.post('/',            authenticate, validate(submitRatingSchema), ratingController.submitRating as any);
router.get ('/my-score',    authenticate, ratingController.getMyScore as any);
router.post('/:id/flag',    authenticate, ratingController.flagRating);

export default router;
` },
  { p: "src/modules/ratings/rating.schemas.ts", c: `import { z } from 'zod';

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
` },
  { p: "src/modules/ratings/rating.service.ts", c: `import { query, queryOne } from '../../db/postgres/client';
import { AppError, ForbiddenError, NotFoundError } from '../../middleware/errorHandler';
import { SCORE_TIERS, MIN_RATERS_FOR_SCORE_UPDATE, RATING_WINDOW_OPEN_HOURS, RATING_WINDOW_CLOSE_HOURS } from '@eventshere/shared';
import { SubmitRatingDto } from './rating.schemas';

function getTier(score: number): string {
  for (const [key, tier] of Object.entries(SCORE_TIERS)) {
    if (score >= tier.min && score <= tier.max) return key.toLowerCase();
  }
  return 'standard';
}

async function recalculateSocialScore(userId: string): Promise<void> {
  const [{ count }] = await query<any>(
    \`SELECT COUNT(DISTINCT rater_id) AS count FROM ratings WHERE ratee_id = $1 AND is_flagged = FALSE\`, [userId]
  );
  if (Number(count) < MIN_RATERS_FOR_SCORE_UPDATE) return;

  const result = await queryOne<{ score: string }>(
    \`WITH ranked AS (
       SELECT AVG((conduct_score+social_score+punctuality_score+attire_score+overall_score)/5.0) AS event_avg,
              ROW_NUMBER() OVER (ORDER BY MAX(created_at) DESC) AS recency_rank
       FROM ratings WHERE ratee_id = $1 AND is_flagged = FALSE GROUP BY event_id
     )
     SELECT SUM(event_avg * (1.0/recency_rank)) / SUM(1.0/recency_rank) AS score FROM ranked\`,
    [userId]
  );
  if (!result?.score) return;

  const normalized = Math.round(((Number(result.score) - 1) / 4) * 1000);
  const clamped    = Math.min(1000, Math.max(0, normalized));
  const tier       = getTier(clamped);

  const current = await queryOne<{ score_history: any[] }>(
    \`SELECT score_history FROM social_scores WHERE user_id = $1\`, [userId]
  );
  const history = [...(current?.score_history ?? []), { score: clamped, tier, calculatedAt: new Date().toISOString() }];
  if (history.length > 50) history.shift();

  await query(
    \`INSERT INTO social_scores (user_id,current_score,tier,last_calculated_at,score_history)
     VALUES ($1,$2,$3,NOW(),$4)
     ON CONFLICT (user_id) DO UPDATE
       SET current_score=$2, tier=$3, last_calculated_at=NOW(), score_history=$4\`,
    [userId, clamped, tier, JSON.stringify(history)]
  );
}

export async function submitRating(raterId: string, dto: SubmitRatingDto) {
  if (raterId === dto.rateeId) throw new AppError('You cannot rate yourself', 400);

  const [raterAttended, rateeAttended] = await Promise.all([
    queryOne(\`SELECT 1 FROM guests WHERE user_id = $1 AND event_id = $2 AND checked_in = TRUE\`, [raterId, dto.eventId]),
    queryOne(\`SELECT 1 FROM guests WHERE user_id = $1 AND event_id = $2 AND checked_in = TRUE\`, [dto.rateeId, dto.eventId]),
  ]);
  if (!raterAttended) throw new ForbiddenError('You did not attend this event');
  if (!rateeAttended) throw new ForbiddenError('The person you are rating did not attend this event');

  const event = await queryOne<{ start_time: string; end_time: string }>(
    \`SELECT start_time, end_time FROM events WHERE id = $1\`, [dto.eventId]
  );
  if (!event) throw new NotFoundError('Event');

  const now          = new Date();
  const windowOpen   = new Date(event.start_time); windowOpen.setHours(windowOpen.getHours() + RATING_WINDOW_OPEN_HOURS);
  const windowClose  = new Date(event.end_time);   windowClose.setHours(windowClose.getHours() + RATING_WINDOW_CLOSE_HOURS);
  if (now < windowOpen)  throw new AppError('Rating window has not opened yet', 400);
  if (now > windowClose) throw new AppError('Rating window has closed', 400);

  const [rating] = await query(
    \`INSERT INTO ratings (rater_id,ratee_id,event_id,conduct_score,social_score,punctuality_score,attire_score,overall_score,comment)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id\`,
    [raterId,dto.rateeId,dto.eventId,dto.conductScore,dto.socialScore,dto.punctualityScore,dto.attireScore,dto.overallScore,dto.comment]
  );

  // Fire and forget — don't block the response
  recalculateSocialScore(dto.rateeId).catch(console.error);
  return { id: rating.id, message: 'Rating submitted' };
}

export async function getMyScore(userId: string) {
  const score = await queryOne(
    \`SELECT current_score, tier, last_calculated_at FROM social_scores WHERE user_id = $1\`, [userId]
  );
  const [breakdown] = await query(
    \`SELECT AVG(conduct_score)::numeric(3,2) AS conduct, AVG(social_score)::numeric(3,2) AS social,
            AVG(punctuality_score)::numeric(3,2) AS punctuality, AVG(attire_score)::numeric(3,2) AS attire,
            AVG(overall_score)::numeric(3,2) AS overall, COUNT(DISTINCT event_id) AS events_rated
     FROM ratings WHERE ratee_id = $1 AND is_flagged = FALSE\`,
    [userId]
  );
  return { score, breakdown };
}

export async function flagRating(ratingId: string) {
  await query(\`UPDATE ratings SET is_flagged = TRUE WHERE id = $1\`, [ratingId]);
}
` },
  { p: "src/modules/search/search.controller.ts", c: `import { Request, Response } from 'express';
import * as searchService from './search.service';

export async function search(req: Request, res: Response): Promise<void> {
  const q    = (req.query.q as string) || '';
  const type = (req.query.type as string) || 'all';
  const data = await searchService.search(q, type);
  res.json({ success: true, data });
}
` },
  { p: "src/modules/search/search.routes.ts", c: `import { Router } from 'express';
import * as searchController from './search.controller';

const router = Router();

router.get('/', searchController.search);

export default router;
` },
  { p: "src/modules/search/search.service.ts", c: `import { query } from '../../db/postgres/client';

export async function search(q: string, type: string) {
  if (!q || q.length < 2) return { venues: [], events: [] };
  const pattern = \`%\${q.toLowerCase()}%\`;
  const result: Record<string, unknown[]> = {};

  if (type === 'venues' || type === 'all') {
    result.venues = await query(
      \`SELECT id,name,short_desc,type,city,state,seated_capacity,full_day_rate,currency,rating,is_verified,
              (SELECT url FROM venue_media WHERE venue_id=venues.id AND media_type='photo' ORDER BY sort_order LIMIT 1) AS cover_photo
       FROM venues
       WHERE status='active' AND (LOWER(name) LIKE $1 OR LOWER(city) LIKE $1 OR LOWER(short_desc) LIKE $1)
       ORDER BY rating DESC NULLS LAST LIMIT 10\`,
      [pattern]
    );
  }

  if (type === 'events' || type === 'all') {
    result.events = await query(
      \`SELECT e.id,e.name,e.type,e.slug,e.start_time,e.cover_image_url,v.name AS venue_name,v.city AS venue_city
       FROM events e LEFT JOIN venues v ON v.id = e.venue_id
       WHERE e.visibility='public' AND e.status='published'
         AND (LOWER(e.name) LIKE $1 OR LOWER(e.description) LIKE $1)
       ORDER BY e.start_time ASC LIMIT 10\`,
      [pattern]
    );
  }

  return result;
}
` },
  { p: "src/modules/seating/seating.algorithm.ts", c: `import { query } from '../../db/postgres/client';
import { NotFoundError } from '../../middleware/errorHandler';
import { Layout } from '../../db/mongo/layout.model';
import { GUEST_CATEGORY_PRIORITY, ZONE_CATEGORY_MAP } from '@eventshere/shared';

interface GuestRow { id: string; name: string; category: string; accessibility_req: string | null; social_score: number; }
interface Seat     { id: string; seatLabel: string; zoneId: string; category: string; isAccessible: boolean; }
interface Zone     { id: string; name: string; type: string; }

export interface SeatingResult {
  assignments: { guestId: string; guestName: string; seatLabel: string; zoneName: string }[];
  unassigned:  string[];
  conflicts:   string[];
}

export async function runSeatAlgorithm(
  eventId: string,
  useScoreInfluence: boolean
): Promise<SeatingResult> {
  const guests = await query<GuestRow>(
    \`SELECT g.id, g.name, g.category, g.accessibility_req,
            COALESCE(ss.current_score, 500) AS social_score
     FROM guests g
     LEFT JOIN social_scores ss ON ss.user_id = g.user_id
     WHERE g.event_id = $1 AND g.rsvp_status = 'confirmed'\`,
    [eventId]
  );
  if (!guests.length) return { assignments: [], unassigned: [], conflicts: [] };

  const layout = await Layout.findOne({ eventId, isActive: true });
  if (!layout) throw new NotFoundError('Active layout — run the 3D planner first');

  const seats: Seat[] = layout.sceneData.seats as any;
  const zones: Zone[] = layout.sceneData.zones as any;
  const zoneMap = new Map(zones.map(z => [z.id, z]));

  // Sort by category priority, then optionally by social score
  guests.sort((a, b) => {
    const p = (GUEST_CATEGORY_PRIORITY[a.category] ?? 5) - (GUEST_CATEGORY_PRIORITY[b.category] ?? 5);
    if (p !== 0) return p;
    return useScoreInfluence ? b.social_score - a.social_score : 0;
  });

  const usedSeatIds = new Set<string>();
  const assignments: SeatingResult['assignments'] = [];
  const unassigned: string[] = [];
  const conflicts:  string[] = [];

  for (const guest of guests) {
    const needsAccessible = !!guest.accessibility_req;
    const pool = needsAccessible
      ? [...seats.filter(s => s.isAccessible), ...seats.filter(s => !s.isAccessible)]
      : seats.filter(s => !s.isAccessible);

    const preferredZoneTypes = Object.entries(ZONE_CATEGORY_MAP)
      .filter(([, cats]) => cats.includes(guest.category))
      .map(([type]) => type);

    // First pass: preferred zone type
    let seat = pool.find(s => {
      if (usedSeatIds.has(s.id)) return false;
      const zone = zoneMap.get(s.zoneId);
      return zone && preferredZoneTypes.includes(zone.type);
    });

    // Second pass: any free seat
    if (!seat) seat = pool.find(s => !usedSeatIds.has(s.id));

    if (!seat) {
      unassigned.push(guest.id);
      conflicts.push(\`No seat available for \${guest.name} (\${guest.category})\`);
      continue;
    }

    usedSeatIds.add(seat.id);
    const zone = zoneMap.get(seat.zoneId);
    assignments.push({
      guestId: guest.id, guestName: guest.name,
      seatLabel: seat.seatLabel, zoneName: zone?.name ?? 'General',
    });
  }

  // Persist
  for (const a of assignments) {
    await query(
      \`INSERT INTO seat_assignments (guest_id,event_id,seat_label,zone_name,assigned_by)
       VALUES ($1,$2,$3,$4,'algorithm')
       ON CONFLICT (guest_id,event_id) DO UPDATE
         SET seat_label=EXCLUDED.seat_label, zone_name=EXCLUDED.zone_name,
             assigned_by='algorithm', assigned_at=NOW()\`,
      [a.guestId, eventId, a.seatLabel, a.zoneName]
    );
  }

  return { assignments, unassigned, conflicts };
}
` },
  { p: "src/modules/seating/seating.controller.ts", c: `import { Response } from 'express';
import { AuthRequest } from '../../types';
import * as seatingService from './seating.service';

export async function runSeating(req: AuthRequest, res: Response): Promise<void> {
  const data = await seatingService.runSeating(req.params.eventId, req.user.userId);
  res.json({ success: true, data });
}
` },
  { p: "src/modules/seating/seating.routes.ts", c: `import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as seatingController from './seating.controller';

const router = Router();

router.post('/:eventId/run', authenticate, seatingController.runSeating as any);

export default router;
` },
  { p: "src/modules/seating/seating.service.ts", c: `import { queryOne } from '../../db/postgres/client';
import { NotFoundError, ForbiddenError } from '../../middleware/errorHandler';
import { runSeatAlgorithm } from './seating.algorithm';

export async function runSeating(eventId: string, requesterId: string) {
  const event = await queryOne<{ planner_id: string; score_influence: string }>(
    \`SELECT planner_id, score_influence FROM events WHERE id = $1\`, [eventId]
  );
  if (!event) throw new NotFoundError('Event');
  if (event.planner_id !== requesterId) throw new ForbiddenError();

  return runSeatAlgorithm(eventId, event.score_influence !== 'off');
}
` },
  { p: "src/modules/uploads/upload.controller.ts", c: `import { Request, Response } from 'express';
import { AppError } from '../../middleware/errorHandler';
import * as uploadService from './upload.service';

export async function uploadImage(req: Request, res: Response): Promise<void> {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const folder = (req.query.folder as string) || 'general';
  const data = await uploadService.uploadToCloudinary(req.file.buffer, folder, 'image');
  res.json({ success: true, data });
}

export async function uploadImages(req: Request, res: Response): Promise<void> {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) throw new AppError('No files uploaded', 400);
  const folder = (req.query.folder as string) || 'general';
  const data = await uploadService.uploadMany(files, folder);
  res.json({ success: true, data });
}

export async function uploadVideo(req: Request, res: Response): Promise<void> {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const data = await uploadService.uploadToCloudinary(req.file.buffer, 'videos', 'video');
  res.json({ success: true, data });
}

export async function uploadModel(req: Request, res: Response): Promise<void> {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const data = await uploadService.uploadToCloudinary(req.file.buffer, 'models', 'raw');
  res.json({ success: true, data });
}
` },
  { p: "src/modules/uploads/upload.routes.ts", c: `import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/errorHandler';
import * as uploadController from './upload.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/octet-stream'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new AppError('File type not allowed', 400));
  },
});

const router = Router();

router.post('/image',  authenticate, upload.single('file'),     uploadController.uploadImage);
router.post('/images', authenticate, upload.array('files', 10), uploadController.uploadImages);
router.post('/video',  authenticate, upload.single('file'),     uploadController.uploadVideo);
router.post('/model',  authenticate, upload.single('file'),     uploadController.uploadModel);

export default router;
` },
  { p: "src/modules/uploads/upload.service.ts", c: `import cloudinary from '../../config/cloudinary';
import { AppError } from '../../middleware/errorHandler';

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: \`eventshere/\${folder}\`, resource_type: resourceType },
      (err, result) => {
        if (err || !result) return reject(err ?? new AppError('Upload failed', 500));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function uploadMany(
  files: Express.Multer.File[],
  folder: string
) {
  return Promise.all(files.map(f => uploadToCloudinary(f.buffer, folder, 'image')));
}
` },
  { p: "src/modules/users/user.controller.ts", c: `import { Response } from 'express';
import { AuthRequest } from '../../types';
import * as userService from './user.service';

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const data = await userService.getProfile(req.user.userId);
  res.json({ success: true, data });
}

export async function updateMe(req: AuthRequest, res: Response): Promise<void> {
  const data = await userService.updateProfile(req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function getPublicProfile(req: AuthRequest, res: Response): Promise<void> {
  const data = await userService.getPublicProfile(req.params.id);
  res.json({ success: true, data });
}

export async function getMyScoreHistory(req: AuthRequest, res: Response): Promise<void> {
  const data = await userService.getScoreHistory(req.user.userId);
  res.json({ success: true, data });
}
` },
  { p: "src/modules/users/user.routes.ts", c: `import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateProfileSchema } from './user.schemas';
import * as userController from './user.controller';

const router = Router();

router.get ('/me',               authenticate, userController.getMe as any);
router.patch('/me',              authenticate, validate(updateProfileSchema), userController.updateMe as any);
router.get ('/me/score-history', authenticate, userController.getMyScoreHistory as any);
router.get ('/:id',              authenticate, userController.getPublicProfile as any);

export default router;
` },
  { p: "src/modules/users/user.schemas.ts", c: `import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  bio:         z.string().max(500).optional(),
  phone:       z.string().max(20).optional(),
  photoUrl:    z.string().url().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
` },
  { p: "src/modules/users/user.service.ts", c: `import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError } from '../../middleware/errorHandler';
import { buildSetClause } from '../../utils/helpers';
import { UpdateProfileDto } from './user.schemas';

export async function getProfile(userId: string) {
  const user = await queryOne(
    \`SELECT u.id, u.email, u.role, u.status, u.created_at,
            p.display_name, p.photo_url, p.bio, p.phone,
            ss.current_score, ss.tier
     FROM users u
     JOIN user_profiles p  ON p.user_id = u.id
     LEFT JOIN social_scores ss ON ss.user_id = u.id
     WHERE u.id = $1\`,
    [userId]
  );
  if (!user) throw new NotFoundError('User');
  return user;
}

export async function updateProfile(userId: string, dto: UpdateProfileDto) {
  const fields: Record<string, unknown> = {};
  if (dto.displayName !== undefined) fields.display_name = dto.displayName;
  if (dto.bio         !== undefined) fields.bio          = dto.bio;
  if (dto.phone       !== undefined) fields.phone        = dto.phone;
  if (dto.photoUrl    !== undefined) fields.photo_url    = dto.photoUrl;
  fields.updated_at = new Date();

  const { clause, values } = buildSetClause(fields);
  await query(
    \`UPDATE user_profiles SET \${clause} WHERE user_id = $\${values.length + 1}\`,
    [...values, userId]
  );
  return getProfile(userId);
}

export async function getPublicProfile(userId: string) {
  const user = await queryOne(
    \`SELECT u.id, u.role, p.display_name, p.photo_url, p.bio,
            ss.current_score, ss.tier
     FROM users u
     JOIN user_profiles p  ON p.user_id = u.id
     LEFT JOIN social_scores ss ON ss.user_id = u.id
     WHERE u.id = $1 AND u.status = 'active'\`,
    [userId]
  );
  if (!user) throw new NotFoundError('User');
  return user;
}

export async function getScoreHistory(userId: string) {
  const row = await queryOne<{ score_history: unknown[] }>(
    \`SELECT score_history FROM social_scores WHERE user_id = $1\`, [userId]
  );
  return row?.score_history ?? [];
}
` },
  { p: "src/modules/venues/venue.controller.ts", c: `import { Request, Response } from 'express';
import { AuthRequest } from '../../types';
import * as venueService from './venue.service';

export async function createVenue(req: AuthRequest, res: Response): Promise<void> {
  const data = await venueService.createVenue(req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function getVenueById(req: Request, res: Response): Promise<void> {
  const data = await venueService.getVenueById(req.params.id);
  res.json({ success: true, data });
}

export async function updateVenue(req: AuthRequest, res: Response): Promise<void> {
  const data = await venueService.updateVenue(req.params.id, req.user.userId, req.body);
  res.json({ success: true, data });
}

export async function deleteVenue(req: AuthRequest, res: Response): Promise<void> {
  await venueService.deleteVenue(req.params.id, req.user.userId, req.user.role);
  res.json({ success: true });
}

export async function searchVenues(req: Request, res: Response): Promise<void> {
  const data = await venueService.searchVenues(req.query as Record<string, string>);
  res.json({ success: true, data });
}

export async function getMyVenues(req: AuthRequest, res: Response): Promise<void> {
  const data = await venueService.getMyVenues(req.user.userId);
  res.json({ success: true, data });
}

export async function addMedia(req: AuthRequest, res: Response): Promise<void> {
  const data = await venueService.addMedia(req.params.id, req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function deleteMedia(req: AuthRequest, res: Response): Promise<void> {
  await venueService.deleteMedia(req.params.mediaId, req.user.userId);
  res.json({ success: true });
}

export async function getAvailability(req: Request, res: Response): Promise<void> {
  const data = await venueService.getAvailability(req.params.id, req.query.month as string);
  res.json({ success: true, data });
}

export async function setAvailability(req: AuthRequest, res: Response): Promise<void> {
  await venueService.setAvailability(req.params.id, req.user.userId, req.body);
  res.json({ success: true });
}

export async function getReviews(req: Request, res: Response): Promise<void> {
  const data = await venueService.getReviews(req.params.id);
  res.json({ success: true, data });
}

export async function addReview(req: AuthRequest, res: Response): Promise<void> {
  const data = await venueService.addReview(req.params.id, req.user.userId, req.body);
  res.status(201).json({ success: true, data });
}
` },
  { p: "src/modules/venues/venue.routes.ts", c: `import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createVenueSchema, updateVenueSchema, addMediaSchema, blockDateSchema, addReviewSchema } from './venue.schemas';
import * as venueController from './venue.controller';

const router = Router();

// Public routes
router.get('/',                    venueController.searchVenues);
router.get('/:id',                 venueController.getVenueById);
router.get('/:id/availability',    venueController.getAvailability);
router.get('/:id/reviews',         venueController.getReviews);

// Authenticated routes
router.get('/owner/my',            authenticate, authorize('venue_owner'), venueController.getMyVenues as any);
router.post('/',                   authenticate, authorize('venue_owner'), validate(createVenueSchema),  venueController.createVenue as any);
router.patch('/:id',               authenticate, authorize('venue_owner'), validate(updateVenueSchema),  venueController.updateVenue as any);
router.delete('/:id',              authenticate,                           venueController.deleteVenue as any);
router.post('/:id/media',          authenticate, authorize('venue_owner'), validate(addMediaSchema),     venueController.addMedia as any);
router.delete('/media/:mediaId',   authenticate, authorize('venue_owner'), venueController.deleteMedia as any);
router.post('/:id/availability',   authenticate, authorize('venue_owner'), validate(blockDateSchema),    venueController.setAvailability as any);
router.post('/:id/reviews',        authenticate, authorize('planner'),     validate(addReviewSchema),    venueController.addReview as any);

export default router;
` },
  { p: "src/modules/venues/venue.schemas.ts", c: `import { z } from 'zod';

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
  date:      z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
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
` },
  { p: "src/modules/venues/venue.service.ts", c: `import { query, queryOne } from '../../db/postgres/client';
import { NotFoundError, ForbiddenError } from '../../middleware/errorHandler';
import { buildSetClause, paginate, paginatedResult } from '../../utils/helpers';
import { CreateVenueDto, UpdateVenueDto, AddMediaDto, BlockDateDto, AddReviewDto } from './venue.schemas';

export async function createVenue(ownerId: string, dto: CreateVenueDto) {
  const [venue] = await query(
    \`INSERT INTO venues (owner_id,name,short_desc,full_desc,type,address,city,state,country,
       lat,lng,seated_capacity,standing_capacity,length_m,width_m,height_m,amenities,
       hourly_rate,half_day_rate,full_day_rate,currency,security_deposit,cleaning_fee,min_notice_hours)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
     RETURNING *\`,
    [ownerId,dto.name,dto.shortDesc,dto.fullDesc,dto.type,dto.address,dto.city,dto.state,dto.country,
     dto.lat,dto.lng,dto.seatedCapacity,dto.standingCapacity,dto.lengthM,dto.widthM,dto.heightM,dto.amenities,
     dto.hourlyRate,dto.halfDayRate,dto.fullDayRate,dto.currency,dto.securityDeposit,dto.cleaningFee,dto.minNoticeHours]
  );
  return venue;
}

export async function getVenueById(id: string) {
  const venue = await queryOne(
    \`SELECT v.*, p.display_name AS owner_name, p.photo_url AS owner_photo
     FROM venues v
     JOIN user_profiles p ON p.user_id = v.owner_id
     WHERE v.id = $1\`,
    [id]
  );
  if (!venue) throw new NotFoundError('Venue');
  const media = await query(\`SELECT * FROM venue_media WHERE venue_id = $1 ORDER BY sort_order\`, [id]);
  return { ...venue, media };
}

export async function updateVenue(id: string, requesterId: string, dto: UpdateVenueDto) {
  const venue = await queryOne<{ owner_id: string }>(\`SELECT owner_id FROM venues WHERE id = $1\`, [id]);
  if (!venue) throw new NotFoundError('Venue');
  if (venue.owner_id !== requesterId) throw new ForbiddenError();

  const fields: Record<string, unknown> = { updated_at: new Date() };
  if (dto.name             !== undefined) fields.name              = dto.name;
  if (dto.shortDesc        !== undefined) fields.short_desc        = dto.shortDesc;
  if (dto.fullDesc         !== undefined) fields.full_desc         = dto.fullDesc;
  if (dto.address          !== undefined) fields.address           = dto.address;
  if (dto.city             !== undefined) fields.city              = dto.city;
  if (dto.state            !== undefined) fields.state             = dto.state;
  if (dto.seatedCapacity   !== undefined) fields.seated_capacity   = dto.seatedCapacity;
  if (dto.standingCapacity !== undefined) fields.standing_capacity = dto.standingCapacity;
  if (dto.amenities        !== undefined) fields.amenities         = dto.amenities;
  if (dto.hourlyRate       !== undefined) fields.hourly_rate       = dto.hourlyRate;
  if (dto.halfDayRate      !== undefined) fields.half_day_rate     = dto.halfDayRate;
  if (dto.fullDayRate      !== undefined) fields.full_day_rate     = dto.fullDayRate;
  if (dto.minNoticeHours   !== undefined) fields.min_notice_hours  = dto.minNoticeHours;

  const { clause, values } = buildSetClause(fields);
  const [updated] = await query(
    \`UPDATE venues SET \${clause} WHERE id = $\${values.length + 1} RETURNING *\`,
    [...values, id]
  );
  return updated;
}

export async function deleteVenue(id: string, requesterId: string, role: string) {
  const venue = await queryOne<{ owner_id: string }>(\`SELECT owner_id FROM venues WHERE id = $1\`, [id]);
  if (!venue) throw new NotFoundError('Venue');
  if (venue.owner_id !== requesterId && role !== 'admin') throw new ForbiddenError();
  await query(\`DELETE FROM venues WHERE id = $1\`, [id]);
}

export async function searchVenues(params: Record<string, string>) {
  const { page, limit, offset } = paginate(Number(params.page), Number(params.limit));
  const conditions: string[] = [\`v.status = 'active'\`];
  const values: unknown[] = [];
  let i = 1;

  if (params.city)        { conditions.push(\`LOWER(v.city) LIKE $\${i++}\`);     values.push(\`%\${params.city.toLowerCase()}%\`); }
  if (params.type)        { conditions.push(\`v.type = $\${i++}\`);               values.push(params.type); }
  if (params.minCapacity) { conditions.push(\`v.seated_capacity >= $\${i++}\`);   values.push(Number(params.minCapacity)); }
  if (params.maxCapacity) { conditions.push(\`v.seated_capacity <= $\${i++}\`);   values.push(Number(params.maxCapacity)); }
  if (params.minPrice)    { conditions.push(\`v.full_day_rate >= $\${i++}\`);     values.push(Number(params.minPrice)); }
  if (params.maxPrice)    { conditions.push(\`v.full_day_rate <= $\${i++}\`);     values.push(Number(params.maxPrice)); }
  if (params.amenities)   { conditions.push(\`v.amenities @> $\${i++}\`);         values.push(params.amenities.split(',')); }

  const where = conditions.join(' AND ');
  const orderMap: Record<string, string> = {
    rating: 'v.rating DESC NULLS LAST', price_asc: 'v.full_day_rate ASC',
    price_desc: 'v.full_day_rate DESC', newest: 'v.created_at DESC',
  };
  const order = orderMap[params.sort] ?? 'v.created_at DESC';

  const [{ count }] = await query<any>(\`SELECT COUNT(*) FROM venues v WHERE \${where}\`, values);
  const rows = await query(
    \`SELECT v.id,v.name,v.short_desc,v.type,v.city,v.state,v.seated_capacity,
            v.full_day_rate,v.currency,v.rating,v.review_count,v.is_verified,
            (SELECT url FROM venue_media WHERE venue_id=v.id AND media_type='photo' ORDER BY sort_order LIMIT 1) AS cover_photo
     FROM venues v WHERE \${where} ORDER BY \${order} LIMIT $\${i++} OFFSET $\${i++}\`,
    [...values, limit, offset]
  );
  return paginatedResult(rows, Number(count), page, limit);
}

export async function getMyVenues(ownerId: string) {
  return query(
    \`SELECT v.*, (SELECT COUNT(*) FROM bookings b WHERE b.venue_id = v.id) AS booking_count
     FROM venues v WHERE v.owner_id = $1 ORDER BY v.created_at DESC\`,
    [ownerId]
  );
}

export async function addMedia(venueId: string, requesterId: string, dto: AddMediaDto) {
  const venue = await queryOne<{ owner_id: string }>(\`SELECT owner_id FROM venues WHERE id = $1\`, [venueId]);
  if (!venue) throw new NotFoundError('Venue');
  if (venue.owner_id !== requesterId) throw new ForbiddenError();
  const [media] = await query(
    \`INSERT INTO venue_media (venue_id,media_type,url,thumbnail_url,sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *\`,
    [venueId, dto.mediaType, dto.url, dto.thumbnailUrl, dto.sortOrder]
  );
  return media;
}

export async function deleteMedia(mediaId: string, requesterId: string) {
  const row = await queryOne(
    \`SELECT vm.id FROM venue_media vm JOIN venues v ON v.id = vm.venue_id
     WHERE vm.id = $1 AND v.owner_id = $2\`,
    [mediaId, requesterId]
  );
  if (!row) throw new ForbiddenError('Not your media or not found');
  await query(\`DELETE FROM venue_media WHERE id = $1\`, [mediaId]);
}

export async function getAvailability(venueId: string, month: string) {
  return query(
    \`SELECT date, is_blocked, booking_id FROM venue_availability
     WHERE venue_id = $1 AND to_char(date,'YYYY-MM') = $2 ORDER BY date\`,
    [venueId, month]
  );
}

export async function setAvailability(venueId: string, requesterId: string, dto: BlockDateDto) {
  const venue = await queryOne<{ owner_id: string }>(\`SELECT owner_id FROM venues WHERE id = $1\`, [venueId]);
  if (!venue) throw new NotFoundError('Venue');
  if (venue.owner_id !== requesterId) throw new ForbiddenError();
  await query(
    \`INSERT INTO venue_availability (venue_id,date,is_blocked) VALUES ($1,$2,$3)
     ON CONFLICT (venue_id,date) DO UPDATE SET is_blocked = EXCLUDED.is_blocked\`,
    [venueId, dto.date, dto.isBlocked]
  );
}

export async function getReviews(venueId: string) {
  return query(
    \`SELECT r.*, p.display_name AS reviewer_name, p.photo_url AS reviewer_photo
     FROM venue_reviews r
     JOIN user_profiles p ON p.user_id = r.reviewer_id
     WHERE r.venue_id = $1 ORDER BY r.created_at DESC\`,
    [venueId]
  );
}

export async function addReview(venueId: string, reviewerId: string, dto: AddReviewDto) {
  const booked = await queryOne(
    \`SELECT b.id FROM bookings b JOIN events e ON e.id = b.event_id
     WHERE b.venue_id = $1 AND b.planner_id = $2 AND b.status = 'completed' LIMIT 1\`,
    [venueId, reviewerId]
  );
  if (!booked) throw new ForbiddenError('You can only review venues where you completed an event');
  const [review] = await query(
    \`INSERT INTO venue_reviews (venue_id,reviewer_id,cleanliness,capacity_accuracy,staff_helpfulness,amenity_accuracy,overall,comment)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *\`,
    [venueId,reviewerId,dto.cleanliness,dto.capacityAccuracy,dto.staffHelpfulness,dto.amenityAccuracy,dto.overall,dto.comment]
  );
  await query(
    \`UPDATE venues SET
       rating = (SELECT AVG(overall) FROM venue_reviews WHERE venue_id = $1),
       review_count = (SELECT COUNT(*) FROM venue_reviews WHERE venue_id = $1)
     WHERE id = $1\`,
    [venueId]
  );
  return review;
}
` },
  { p: "src/socket/index.ts", c: `import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function initSocket(io: SocketServer): void {
  // Auth handshake — every connection must send a valid JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('No token'));
    try {
      const payload = jwt.verify(token, env.JWT.ACCESS_SECRET) as { userId: string; role: string };
      socket.data.userId = payload.userId;
      socket.data.role   = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(\`[Socket] connected: \${socket.data.userId}\`);

    // Planner joins event room to get live updates
    socket.on('join:event', (eventId: string) => {
      socket.join(\`event:\${eventId}\`);
    });

    socket.on('leave:event', (eventId: string) => {
      socket.leave(\`event:\${eventId}\`);
    });

    // Check-in scanner emits this — server broadcasts to all planners watching the event
    socket.on('checkin:scan', (data: { eventId: string; guestId: string }) => {
      io.to(\`event:\${data.eventId}\`).emit('checkin:update', data);
    });

    // 3D layout collaborative editing
    socket.on('layout:update', (data: { eventId: string; change: unknown }) => {
      socket.to(\`event:\${data.eventId}\`).emit('layout:change', data.change);
    });

    // Planner sends announcement to all guests in the event room
    socket.on('event:announce', (data: { eventId: string; message: string }) => {
      io.to(\`event:\${data.eventId}\`).emit('event:announcement', {
        message: data.message,
        from: socket.data.userId,
        at: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(\`[Socket] disconnected: \${socket.data.userId}\`);
    });
  });
}
` },
  { p: "src/types/index.ts", c: `import { Request } from 'express';
import { UserRole } from '@eventshere/shared';

export interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
` },
  { p: "src/utils/email.ts", c: `import sgMail from '@sendgrid/mail';
import { env } from '../config/env';

sgMail.setApiKey(env.SENDGRID_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: EmailOptions): Promise<void> {
  if (env.NODE_ENV === 'development' && !env.SENDGRID_API_KEY) {
    console.log(\`\\n📧 [DEV EMAIL]\\nTo: \${opts.to}\\nSubject: \${opts.subject}\\n\`);
    return;
  }
  await sgMail.send({ from: env.EMAIL_FROM, ...opts });
}

export function invitationTemplate(p: {
  guestName: string; eventName: string; eventDate: string;
  venueName: string; rsvpUrl: string; rsvpDeadline: string;
}) {
  return {
    subject: \`You're invited to \${p.eventName}\`,
    html: \`<h2>Hello \${p.guestName},</h2>
           <p>You are invited to <strong>\${p.eventName}</strong> on <strong>\${p.eventDate}</strong> at <strong>\${p.venueName}</strong>.</p>
           <p>Please RSVP before <strong>\${p.rsvpDeadline}</strong>.</p>
           <a href="\${p.rsvpUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">RSVP Now</a>\`,
    text: \`You're invited to \${p.eventName} on \${p.eventDate} at \${p.venueName}. RSVP: \${p.rsvpUrl}\`,
  };
}

export function seatAssignmentTemplate(p: {
  guestName: string; eventName: string; eventDate: string;
  seatLabel: string; zoneName: string; seatFinderUrl: string; qrCodeDataUrl: string;
}) {
  return {
    subject: \`Your seat for \${p.eventName} — \${p.seatLabel}\`,
    html: \`<h2>Hello \${p.guestName},</h2>
           <p>Your seat for <strong>\${p.eventName}</strong> is <strong>\${p.seatLabel}</strong> in \${p.zoneName}.</p>
           <p><a href="\${p.seatFinderUrl}">View your seat on the 3D map →</a></p>
           <p>Show this QR code at check-in:</p>
           <img src="\${p.qrCodeDataUrl}" width="200" alt="Check-in QR" />\`,
    text: \`Your seat for \${p.eventName}: \${p.seatLabel} (\${p.zoneName}). Map: \${p.seatFinderUrl}\`,
  };
}

export function bookingConfirmationTemplate(p: {
  plannerName: string; venueName: string; eventDate: string;
  totalAmount: string; currency: string;
}) {
  return {
    subject: \`Booking Confirmed — \${p.venueName}\`,
    html: \`<h2>Booking Confirmed!</h2>
           <p>Hello \${p.plannerName}, your booking for <strong>\${p.venueName}</strong> on <strong>\${p.eventDate}</strong> is confirmed.</p>
           <p>Amount paid: <strong>\${p.currency} \${p.totalAmount}</strong></p>\`,
    text: \`Booking confirmed for \${p.venueName} on \${p.eventDate}. Amount: \${p.currency} \${p.totalAmount}\`,
  };
}
` },
  { p: "src/utils/helpers.ts", c: `import crypto from 'crypto';
import { PaginatedResult } from '../types';

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-');
}

export function generateSlug(name: string): string {
  return \`\${slugify(name)}-\${crypto.randomBytes(3).toString('hex')}\`;
}

export function paginate(page = 1, limit = 20) {
  const safePage  = Math.max(1, Number(page)  || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  return { page: safePage, limit: safeLimit, offset: (safePage - 1) * safeLimit };
}

export function paginatedResult<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/** Build a dynamic SET clause for SQL UPDATE — returns { clause, values } */
export function buildSetClause(fields: Record<string, unknown>, startAt = 1) {
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  const clause  = entries.map(([key], i) => \`\${key} = $\${i + startAt}\`).join(', ');
  const values  = entries.map(([, v]) => v);
  return { clause, values };
}
` },
  { p: "src/utils/qrcode.ts", c: `import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, { errorCorrectionLevel: 'M', width: 300 });
}
` },
  { p: "package.json", c: `{
  "name": "@eventshere/server",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "node -r ts-node/register src/db/postgres/migrate.ts",
    "db:seed": "node -r ts-node/register src/db/postgres/seed.ts"
  },
  "dependencies": {
    "express": "^4.19.2",
    "express-async-errors": "^3.1.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.4.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.4.0",
    "pg": "^8.11.5",
    "redis": "^4.6.14",
    "socket.io": "^4.7.5",
    "cloudinary": "^2.3.1",
    "multer": "^1.4.5-lts.1",
    "zod": "^3.23.8",
    "uuid": "^10.0.0",
    "express-rate-limit": "^7.3.1",
    "cookie-parser": "^1.4.6",
    "nodemailer": "^6.9.13",
    "@sendgrid/mail": "^8.1.3",
    "qrcode": "^1.5.3",
    "csv-parse": "^5.5.6"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/multer": "^1.4.11",
    "@types/uuid": "^10.0.0",
    "@types/cookie-parser": "^1.4.7",
    "@types/qrcode": "^1.5.5",
    "@types/node": "^20.14.2",
    "typescript": "^5.4.5",
    "ts-node-dev": "^2.0.0",
    "ts-node": "^10.9.2"
  }
}
` },
  { p: "tsconfig.json", c: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "paths": {
      "@eventshere/shared": ["../shared/src"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
` },
];

let created=0, skipped=0, failed=0;
console.log("\nCreating files in: " + BASE + "\n");
for (const file of files) {
  try {
    const full = path.join(BASE, file.p);
    const dir  = path.dirname(full);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(full)) { console.log("  SKIP   " + file.p); skipped++; }
    else { fs.writeFileSync(full, file.c, 'utf8'); console.log("  CREATE " + file.p); created++; }
  } catch(e) { console.log("  ERROR  " + file.p + " -> " + e.message); failed++; }
}
console.log("\n========================================");
console.log("Created: " + created + "  Skipped: " + skipped + "  Failed: " + failed);
console.log("========================================\n");
