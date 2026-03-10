import { Server as SocketServer } from 'socket.io';
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
    console.log(`[Socket] connected: ${socket.data.userId}`);

    // Planner joins event room to get live updates
    socket.on('join:event', (eventId: string) => {
      socket.join(`event:${eventId}`);
    });

    socket.on('leave:event', (eventId: string) => {
      socket.leave(`event:${eventId}`);
    });

    // Check-in scanner emits this — server broadcasts to all planners watching the event
    socket.on('checkin:scan', (data: { eventId: string; guestId: string }) => {
      io.to(`event:${data.eventId}`).emit('checkin:update', data);
    });

    // 3D layout collaborative editing
    socket.on('layout:update', (data: { eventId: string; change: unknown }) => {
      socket.to(`event:${data.eventId}`).emit('layout:change', data.change);
    });

    // Planner sends announcement to all guests in the event room
    socket.on('event:announce', (data: { eventId: string; message: string }) => {
      io.to(`event:${data.eventId}`).emit('event:announcement', {
        message: data.message,
        from: socket.data.userId,
        at: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] disconnected: ${socket.data.userId}`);
    });
  });
}
