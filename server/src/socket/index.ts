import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../middleware/auth.middleware';

export function initSocket(io: Server) {
  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as JwtPayload;
    console.log(`Socket connected: ${user.userId} (${user.role})`);

    // Join a room for each event the user is part of
    socket.on('join:event', (eventId: string) => {
      socket.join(`event:${eventId}`);
    });

    socket.on('leave:event', (eventId: string) => {
      socket.leave(`event:${eventId}`);
    });

    // ── Check-in events ──
    socket.on('checkin:scan', (data: { eventId: string; guestId: string }) => {
      // Emit to all planners watching this event
      io.to(`event:${data.eventId}`).emit('checkin:update', {
        guestId: data.guestId,
        timestamp: new Date(),
      });
    });

    // ── Layout collaboration ──
    socket.on('layout:update', (data: { eventId: string; change: unknown }) => {
      // Broadcast layout change to all co-planners except sender
      socket.to(`event:${data.eventId}`).emit('layout:change', data.change);
    });

    // ── Real-time announcements ──
    socket.on('event:announce', (data: { eventId: string; message: string }) => {
      io.to(`event:${data.eventId}`).emit('event:announcement', {
        message: data.message,
        sentAt: new Date(),
        sentBy: user.userId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${user.userId}`);
    });
  });
}
