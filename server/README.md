# EventShere — Server

This is the backend package for the EventShere platform. It is an Express application written in TypeScript that exposes a REST API and a Socket.IO server. It handles user authentication, venue management, event coordination, guest management, seating assignment, and multi-gateway payment processing.

---

## Architecture Overview

The server follows a layered module structure. Each concern has a single, dedicated file per layer, organized into flat directories rather than per-feature folders. This makes it straightforward to locate any piece of logic by type.

```
server/
└── src/
    ├── config/           # Environment variable validation, Cloudinary, Redis clients
    ├── controllers/      # HTTP request handlers — parse req, call service, send res
    ├── db/
    │   ├── postgres/     # pg pool client, migration script, seed script
    │   └── mongo/        # Mongoose client and Layout schema
    ├── middleware/        # auth, error handler, not-found, request validation
    ├── routes/            # Express routers, one file per resource + an index
    ├── schemas/           # Zod validation schemas and inferred DTOs
    ├── services/          # Business logic — database queries, external API calls
    ├── socket/            # Socket.IO event handlers
    ├── types/             # Shared TypeScript interface declarations
    ├── utils/             # Email templates, helper functions, QR generation
    └── index.ts           # App bootstrap — middleware chain, routes, socket attach
```

The guiding rule is that controllers do not touch the database and services do not touch `req`/`res`. All inputs are validated at the route boundary using Zod schemas before reaching the controller.

---

## API Reference

All routes are prefixed with `/api/v1`.

### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create a new user account |
| POST | `/auth/login` | No | Login and receive an access token |
| POST | `/auth/refresh` | Cookie | Rotate the refresh token |
| POST | `/auth/logout` | Cookie | Revoke the current refresh token |
| GET | `/auth/me` | Yes | Return the authenticated user's profile |
| POST | `/auth/forgot-password` | No | Request a password reset email |
| POST | `/auth/reset-password` | No | Confirm a reset token and set a new password |

### Venues

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/venues` | No | Search and filter venues |
| POST | `/venues` | Yes | Create a venue listing |
| GET | `/venues/:id` | No | Get venue details and media |
| PATCH | `/venues/:id` | Yes | Update venue details |
| DELETE | `/venues/:id` | Yes | Delete a venue |
| GET | `/venues/:id/availability` | No | Get blocked/booked dates for a month |
| POST | `/venues/:id/availability` | Yes | Block or unblock a date |
| POST | `/venues/:id/media` | Yes | Add a photo, video, or floor plan |
| DELETE | `/venues/media/:mediaId` | Yes | Remove a media item |
| POST | `/venues/:id/reviews` | Yes | Submit a verified review |
| GET | `/venues/:id/reviews` | No | List all reviews for a venue |

### Bookings

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/bookings` | Yes | Request a venue booking |
| GET | `/bookings/my` | Yes | List the caller's bookings |
| GET | `/bookings/:id` | Yes | Get booking details |
| PATCH | `/bookings/:id/respond` | Yes | Venue owner accepts or rejects a booking |
| PATCH | `/bookings/:id/confirm` | Yes | Planner confirms after venue accepts |

### Events

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/events` | Yes | Create an event |
| GET | `/events/my` | Yes | List the caller's events |
| GET | `/events/:idOrSlug` | No | Get event details |
| PATCH | `/events/:id` | Yes | Update event details |
| DELETE | `/events/:id` | Yes | Delete an event |
| POST | `/events/:id/co-planners` | Yes | Add a co-planner |
| POST | `/events/:id/runsheet` | Yes | Add a runsheet item |
| GET | `/events/:id/runsheet` | No | List runsheet items |

### Guests

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/events/:id/guests` | Yes | Add a guest manually |
| POST | `/events/:id/guests/bulk` | Yes | Bulk add guests via JSON array |
| GET | `/events/:id/guests` | Yes | List all guests |
| PATCH | `/guests/:guestId/checkin` | Yes | Mark a guest as checked in |

### Invitations

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/events/:id/invitations` | Yes | Send invitations to guests |
| GET | `/events/:id/invitations/stats` | Yes | View RSVP statistics |
| PATCH | `/invitations/:token/rsvp` | No | Guest responds to an invitation |

### Seating

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/events/:id/seating/assign` | Yes | Run the seat assignment algorithm |
| GET | `/events/:id/seating` | Yes | Get current seat assignments |
| GET | `/events/:id/seating/find` | No | Guest looks up their assigned seat |

### Layouts (MongoDB)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/events/:id/layouts` | Yes | Save a new seat map version |
| GET | `/events/:id/layouts` | Yes | List saved layouts |
| POST | `/events/:id/layouts/:layoutId/activate` | Yes | Set a layout as active |
| DELETE | `/layouts/:layoutId` | Yes | Delete a layout version |
| GET | `/events/:id/layouts/seats` | Yes | Get the active layout's seat list |

### Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/payments/initialize` | Yes | Initialize a payment (auto-routes to Paystack, Flutterwave, or Stripe based on booking currency) |
| POST | `/payments/webhook` | No | Unified webhook receiver for all gateways |
| GET | `/payments/verify/:reference` | Yes | Verify a payment by reference |

### Notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | Yes | List the caller's notifications |
| GET | `/notifications/unread-count` | Yes | Get unread notification count |
| PATCH | `/notifications/:id/read` | Yes | Mark a notification as read |
| PATCH | `/notifications/read-all` | Yes | Mark all notifications as read |

### Ratings

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/ratings` | Yes | Submit a rating for another user |
| GET | `/ratings/my-score` | Yes | Get the caller's current social score |
| POST | `/ratings/:id/flag` | Yes | Flag a rating for review |

### Search

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/search` | No | Full-text search across venues and events |

### Uploads

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/uploads/image` | Yes | Upload a single image to Cloudinary |
| POST | `/uploads/images` | Yes | Upload up to 10 images |
| POST | `/uploads/video` | Yes | Upload a video |
| POST | `/uploads/model` | Yes | Upload a 3D GLB model file |

### Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/stats` | Admin | Platform-wide statistics |
| GET | `/admin/users` | Admin | List all users |
| PATCH | `/admin/users/:id/status` | Admin | Suspend or activate a user |
| GET | `/admin/venues/pending` | Admin | List venues pending verification |
| PATCH | `/admin/venues/:id/verify` | Admin | Approve or reject a venue listing |
| GET | `/admin/ratings/flagged` | Admin | List flagged ratings |
| DELETE | `/admin/ratings/:id` | Admin | Remove a rating |

---

## Authentication

The server uses a dual-token scheme. A short-lived JWT access token (15 minutes) is sent in the `Authorization: Bearer <token>` header. A long-lived opaque refresh token (7 days) is stored in an HTTP-only cookie and rotated on every `/auth/refresh` call.

Account lockout is enforced at the login endpoint. Five consecutive failed attempts lock the account for 30 minutes. The lockout clears automatically on a successful login.

---

## Payment Gateway Routing

The gateway is selected automatically based on the currency of the booking. The routing table is defined in `@eventshere/shared` and consumed by the payment service.

| Gateway | Currencies |
|---|---|
| Paystack | NGN, GHS, KES, ZAR |
| Flutterwave | XOF, XAF, UGX, TZS, RWF, ETB, MZN, ZMW, GNF, MWK, SLL, BIF, DJF, SDG, CDF |
| Stripe | USD, GBP, EUR, CAD, AUD, NOK, SEK, DKK, CHF, JPY, MXN, BRL, ARS, INR, SGD, HKD, NZD, PLN, CZK, HUF, RON |

The `/payments/webhook` endpoint auto-detects the incoming gateway from request headers (`x-paystack-signature`, `verif-hash`, or `stripe-signature`) and routes accordingly.

---

## Real-Time Events (Socket.IO)

The server attaches a Socket.IO instance to the HTTP server. Clients authenticate the socket connection using their JWT access token via the handshake `auth.token` field.

| Event (server emits) | Trigger |
|---|---|
| `checkin:updated` | A guest is checked in via the REST API |
| `layout:updated` | A collaborator saves a layout change |
| `announcement` | Planner broadcasts a message to all guests in an event room |
| `new_notification` | The server creates a notification for a user |

Clients join event-specific rooms using `join_event` and leave with `leave_event`.

---

## Environment Variables

Copy `.env.example` to `.env` and set the following:

```
# Server
NODE_ENV=development
PORT=5000

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=eventshere_user
POSTGRES_PASSWORD=eventshere_pass
POSTGRES_DB=eventshere_db

# MongoDB
MONGO_URI=mongodb://localhost:27017/eventshere_layouts

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=<64 random bytes, hex>
JWT_REFRESH_SECRET=<64 random bytes, hex>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Client
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# SendGrid  (leave empty in development — emails log to console)
SENDGRID_API_KEY=
EMAIL_FROM=noreply@eventshere.com

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# Flutterwave
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SMS — Termii (optional)
TERMII_API_KEY=
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled production build |
| `npm run db:migrate` | Create or update the PostgreSQL schema |
| `npm run db:seed` | Seed the database with sample data |

---

## Database

The PostgreSQL schema is managed by a single migration script (`src/db/postgres/migrate.ts`). It is idempotent and safe to re-run. All `CREATE TABLE` statements use `IF NOT EXISTS` and all column additions use `ADD COLUMN IF NOT EXISTS`.

Tables: `users`, `user_profiles`, `social_scores`, `refresh_tokens`, `password_reset_tokens`, `venues`, `venue_media`, `venue_availability`, `venue_reviews`, `bookings`, `events`, `event_co_planners`, `runsheet_items`, `guests`, `invitations`, `seat_assignments`, `notifications`, `ratings`, `vendors`, `currencies`, `countries`.

MongoDB is used exclusively for venue layout documents, which contain zone definitions, seat lists, and version history. These documents are too variable in structure for a relational schema.

---

## Security

- Passwords are hashed with bcrypt at cost factor 12.
- All inputs are validated with Zod before reaching service layer code.
- SQL queries use parameterized statements exclusively via the `pg` driver.
- HTTP security headers are applied globally with Helmet.
- Rate limiting is applied globally with `express-rate-limit`.
- CORS is restricted to the configured `CLIENT_URL`.
- Webhook payloads from each gateway are verified using HMAC signatures before processing.
