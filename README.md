# EventShere

EventShere is a venue booking and event management platform built for a global audience. It connects event planners with venue owners, handles guest coordination, seat assignment, and payments in multiple currencies through a unified API.

The project is organized as an npm workspace monorepo containing three packages: a Node.js/Express server, a React frontend client, and a shared constants/types library consumed by both.

---

## Packages

| Package | Path | Description |
|---|---|---|
| `@eventshere/server` | `server/` | REST API, Socket.IO, and all business logic |
| `@eventshere/client` | `client/` | React frontend application |
| `@eventshere/shared` | `shared/` | Types, constants, and utility functions shared between server and client |

---

## Tech Stack

**Backend**
- Node.js, Express, TypeScript
- PostgreSQL — relational data (users, venues, bookings, events, guests)
- MongoDB — venue layout storage (seat maps, zone configurations)
- Redis — session caching and rate limit state
- Socket.IO — real-time check-in, layout collaboration, and live announcements

**Frontend**
- React, TypeScript, Vite

**Infrastructure**
- Docker Compose (Postgres 16, MongoDB 7, Redis 7)
- Cloudinary — media storage (photos, videos, 3D models)
- SendGrid — transactional email

**Payments**
- Paystack — NGN, GHS, KES, ZAR
- Flutterwave — XOF, UGX, TZS, RWF, and broader African coverage
- Stripe — USD, GBP, EUR, and other international currencies

---

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Docker Desktop (for local databases)

---

## Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/MicMond01/EventShere.git
cd EventShere
```

**2. Install all dependencies**

This installs packages for all three workspaces in one step.

```bash
npm install
```

**3. Build the shared package**

The server and client both import from `@eventshere/shared`. Build it first so the local symlinks resolve correctly.

```bash
cd shared && npm run build && cd ..
```

**4. Configure the server environment**

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and fill in the required values. See [server/README.md](server/README.md) for a full description of every variable.

**5. Start the databases**

```bash
docker-compose up -d
```

This starts PostgreSQL on port `5432`, MongoDB on port `27017`, and Redis on port `6379`. All data is persisted in named Docker volumes.

**6. Run the database migration**

```bash
cd server && npm run db:migrate
```

**7. Start the development servers**

Open two terminals:

```bash
# Terminal 1 — API server (port 5000)
cd server && npm run dev

# Terminal 2 — React client (port 5173)
cd client && npm run dev
```

---

## Repository Structure

```
EventShere/
├── client/               # React frontend
├── server/               # Express API server
├── shared/               # Shared constants and types
│   └── src/
│       └── constants/    # Currencies, countries, tiers, gateway map
├── docker-compose.yml    # Local database services
└── package.json          # Workspace root
```

---

## Contributing

1. Create a branch from `main` using the convention `feature/<name>` or `fix/<name>`.
2. Make your changes. Keep commits scoped to a single concern.
3. Ensure `npx tsc --noEmit` passes in both `server/` and `client/` before opening a pull request.
4. Open a pull request against `main` with a clear description of the change and any relevant testing steps.

---

## License

ISC
