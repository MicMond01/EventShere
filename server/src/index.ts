import 'express-async-errors';
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

// ── Route imports ──
import authRoutes         from './modules/auth/auth.routes';
import userRoutes         from './modules/users/users.routes';
import venueRoutes        from './modules/venues/venues.routes';
import eventRoutes        from './modules/events/events.routes';
import guestRoutes        from './modules/guests/guests.routes';
import bookingRoutes      from './modules/bookings/bookings.routes';
import layoutRoutes       from './modules/layouts/layouts.routes';
import invitationRoutes   from './modules/invitations/invitations.routes';
import ratingRoutes       from './modules/ratings/ratings.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import paymentRoutes      from './modules/payments/payments.routes';
import searchRoutes       from './modules/search/search.routes';
import adminRoutes        from './modules/admin/admin.routes';
import uploadRoutes       from './modules/uploads/uploads.routes';
import seatingRoutes      from './modules/guests/seating.routes';

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

// ── Global middleware ──
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health check ──
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── API routes ──
const API = '/api/v1';
app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/users`,         userRoutes);
app.use(`${API}/venues`,        venueRoutes);
app.use(`${API}/events`,        eventRoutes);
app.use(`${API}/guests`,        guestRoutes);
app.use(`${API}/bookings`,      bookingRoutes);
app.use(`${API}/layouts`,       layoutRoutes);
app.use(`${API}/invitations`,   invitationRoutes);
app.use(`${API}/ratings`,       ratingRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/payments`,      paymentRoutes);
app.use(`${API}/search`,        searchRoutes);
app.use(`${API}/admin`,         adminRoutes);
app.use(`${API}/uploads`,       uploadRoutes);
app.use(`${API}/seating`,       seatingRoutes);

// ── Socket.IO ──
initSocket(io);

// ── Error handling (must be last) ──
app.use(notFound);
app.use(globalErrorHandler);

// ── Start ──
const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectPostgres();
  await connectMongo();
  await connectRedis();

  httpServer.listen(PORT, () => {
    console.log(`\n🚀 EventShere server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO attached`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
  });
}

bootstrap().catch(console.error);
