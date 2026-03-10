import { connectPostgres, getPool } from './client';
import 'dotenv/config';

const schema = `
-- ────────────────────────────────────────────────────────────
--  EventShere PostgreSQL Schema
-- ────────────────────────────────────────────────────────────

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(30)  NOT NULL CHECK (role IN ('venue_owner','planner','guest','vendor','admin')),
  status      VARCHAR(30)  NOT NULL DEFAULT 'active'
              CHECK (status IN ('active','suspended','banned','pending_verification')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name   VARCHAR(100) NOT NULL,
  photo_url      TEXT,
  bio            TEXT,
  phone          VARCHAR(20),
  social_score   INTEGER      NOT NULL DEFAULT 500,
  score_tier     VARCHAR(20)  NOT NULL DEFAULT 'standard',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT    UNIQUE NOT NULL,
  is_revoked  BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── VENUES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venues (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(200) NOT NULL,
  short_desc       VARCHAR(160),
  full_desc        TEXT,
  type             VARCHAR(30)  NOT NULL,
  address          TEXT         NOT NULL,
  city             VARCHAR(100) NOT NULL,
  state            VARCHAR(100) NOT NULL,
  country          VARCHAR(100) NOT NULL DEFAULT 'Nigeria',
  lat              DECIMAL(10,7),
  lng              DECIMAL(10,7),
  seated_capacity  INTEGER,
  standing_capacity INTEGER,
  length_m         DECIMAL(8,2),
  width_m          DECIMAL(8,2),
  height_m         DECIMAL(8,2),
  amenities        TEXT[]       DEFAULT '{}',
  hourly_rate      DECIMAL(12,2),
  half_day_rate    DECIMAL(12,2),
  full_day_rate    DECIMAL(12,2),
  currency         VARCHAR(10)  NOT NULL DEFAULT 'NGN',
  security_deposit DECIMAL(12,2),
  cleaning_fee     DECIMAL(12,2),
  status           VARCHAR(20)  NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','pending_review','active','suspended')),
  is_verified      BOOLEAN      NOT NULL DEFAULT FALSE,
  rating           DECIMAL(3,2),
  review_count     INTEGER      NOT NULL DEFAULT 0,
  min_notice_hours INTEGER      NOT NULL DEFAULT 48,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_media (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id     UUID REFERENCES venues(id) ON DELETE CASCADE,
  media_type   VARCHAR(20) NOT NULL CHECK (media_type IN ('photo','video','floor_plan','model_3d','panorama')),
  url          TEXT        NOT NULL,
  thumbnail_url TEXT,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_availability (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id   UUID REFERENCES venues(id) ON DELETE CASCADE,
  date       DATE        NOT NULL,
  is_blocked BOOLEAN     NOT NULL DEFAULT FALSE,
  booking_id UUID,
  UNIQUE (venue_id, date)
);

CREATE TABLE IF NOT EXISTS venue_reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id         UUID REFERENCES venues(id) ON DELETE CASCADE,
  reviewer_id      UUID REFERENCES users(id),
  event_id         UUID,
  cleanliness      SMALLINT CHECK (cleanliness BETWEEN 1 AND 5),
  capacity_accuracy SMALLINT CHECK (capacity_accuracy BETWEEN 1 AND 5),
  staff_helpfulness SMALLINT CHECK (staff_helpfulness BETWEEN 1 AND 5),
  amenity_accuracy  SMALLINT CHECK (amenity_accuracy BETWEEN 1 AND 5),
  overall          SMALLINT CHECK (overall BETWEEN 1 AND 5),
  comment          TEXT,
  owner_response   TEXT,
  photos           TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── EVENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planner_id     UUID REFERENCES users(id),
  venue_id       UUID REFERENCES venues(id),
  name           VARCHAR(200) NOT NULL,
  type           VARCHAR(30)  NOT NULL,
  description    TEXT,
  start_time     TIMESTAMPTZ  NOT NULL,
  end_time       TIMESTAMPTZ  NOT NULL,
  visibility     VARCHAR(10)  NOT NULL DEFAULT 'private'
                 CHECK (visibility IN ('public','private','unlisted')),
  status         VARCHAR(20)  NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','published','ongoing','completed','cancelled')),
  max_guests     INTEGER      NOT NULL DEFAULT 100,
  rsvp_deadline  TIMESTAMPTZ,
  cover_image_url TEXT,
  slug           VARCHAR(255) UNIQUE,
  seating_mode   VARCHAR(20)  NOT NULL DEFAULT 'manual'
                 CHECK (seating_mode IN ('automatic','manual','hybrid')),
  score_influence VARCHAR(10) NOT NULL DEFAULT 'off'
                 CHECK (score_influence IN ('off','low','medium','high')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_co_planners (
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  permission  VARCHAR(10) NOT NULL DEFAULT 'editor'
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

-- ── GUESTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id      UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id),
  name          VARCHAR(200) NOT NULL,
  email         VARCHAR(255),
  phone         VARCHAR(20),
  category      VARCHAR(20)  NOT NULL DEFAULT 'general'
                CHECK (category IN ('vip','dignitary','family','general','press','vendor_staff')),
  rsvp_status   VARCHAR(15)  NOT NULL DEFAULT 'pending'
                CHECK (rsvp_status IN ('pending','confirmed','declined','tentative','waitlisted')),
  seat_id       UUID,
  checked_in    BOOLEAN      NOT NULL DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  qr_code       TEXT,
  notes         TEXT,
  dietary_req   TEXT,
  accessibility_req TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seat_assignments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id      UUID REFERENCES guests(id) ON DELETE CASCADE,
  event_id      UUID REFERENCES events(id) ON DELETE CASCADE,
  seat_label    VARCHAR(50)  NOT NULL,
  zone_name     VARCHAR(100),
  assigned_by   VARCHAR(20)  NOT NULL DEFAULT 'manual'
                CHECK (assigned_by IN ('algorithm','manual')),
  assigned_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (guest_id, event_id)
);

-- ── BOOKINGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id          UUID REFERENCES venues(id),
  event_id          UUID REFERENCES events(id),
  planner_id        UUID REFERENCES users(id),
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','accepted','declined','counter_offered','confirmed','cancelled','completed')),
  total_amount      DECIMAL(12,2) NOT NULL,
  platform_fee      DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_status    VARCHAR(10)  NOT NULL DEFAULT 'unpaid'
                    CHECK (payment_status IN ('unpaid','partial','paid','refunded')),
  event_date        DATE         NOT NULL,
  message           TEXT,
  special_requirements TEXT,
  paystack_ref      VARCHAR(100),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── INVITATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invitations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
  guest_id     UUID REFERENCES guests(id) ON DELETE CASCADE,
  token        VARCHAR(255) UNIQUE NOT NULL,
  status       VARCHAR(15)  NOT NULL DEFAULT 'sent'
               CHECK (status IN ('sent','viewed','responded','expired')),
  sent_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  viewed_at    TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  channel      VARCHAR(15)  NOT NULL DEFAULT 'email'
               CHECK (channel IN ('email','sms','whatsapp','in_app'))
);

-- ── RATINGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rater_id          UUID REFERENCES users(id),
  ratee_id          UUID REFERENCES users(id),
  event_id          UUID REFERENCES events(id),
  conduct_score     SMALLINT CHECK (conduct_score BETWEEN 1 AND 5),
  social_score      SMALLINT CHECK (social_score BETWEEN 1 AND 5),
  punctuality_score SMALLINT CHECK (punctuality_score BETWEEN 1 AND 5),
  attire_score      SMALLINT CHECK (attire_score BETWEEN 1 AND 5),
  overall_score     SMALLINT CHECK (overall_score BETWEEN 1 AND 5),
  comment           TEXT,
  is_flagged        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (rater_id, ratee_id, event_id)
);

CREATE TABLE IF NOT EXISTS social_scores (
  user_id        UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_score  INTEGER     NOT NULL DEFAULT 500,
  tier           VARCHAR(20) NOT NULL DEFAULT 'standard',
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score_history  JSONB       NOT NULL DEFAULT '[]'
);

-- ── VENDORS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id         UUID REFERENCES events(id) ON DELETE CASCADE,
  name             VARCHAR(200) NOT NULL,
  service_type     VARCHAR(50),
  contact_email    VARCHAR(255),
  contact_phone    VARCHAR(20),
  assigned_zone    VARCHAR(100),
  confirmation_status VARCHAR(15) NOT NULL DEFAULT 'pending'
                   CHECK (confirmation_status IN ('pending','confirmed','cancelled')),
  arrival_time     TIMESTAMPTZ,
  setup_notes      TEXT,
  equipment_list   TEXT,
  qr_code          TEXT,
  arrived_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── NOTIFICATIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL,
  channel         VARCHAR(15) NOT NULL CHECK (channel IN ('push','email','sms','whatsapp')),
  title           VARCHAR(200),
  body            TEXT,
  data            JSONB,
  delivery_status VARCHAR(15) NOT NULL DEFAULT 'pending'
                  CHECK (delivery_status IN ('pending','sent','delivered','failed')),
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_venues_city          ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_status        ON venues(status);
CREATE INDEX IF NOT EXISTS idx_events_planner       ON events(planner_id);
CREATE INDEX IF NOT EXISTS idx_events_status        ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start         ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_guests_event         ON guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_rsvp          ON guests(rsvp_status);
CREATE INDEX IF NOT EXISTS idx_bookings_venue        ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_planner      ON bookings(planner_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ratee         ON ratings(ratee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user   ON refresh_tokens(user_id);
`;

async function migrate() {
  await connectPostgres();
  const pool = getPool();
  console.log(' Running migrations...');
  await pool.query(schema);
  console.log(' Migrations complete');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
