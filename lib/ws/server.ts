import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifySession } from '../auth/utils';
import { logger } from '../core/logger';
import { startSystemBroadcaster } from './broadcaster';
import { startStatsStream, stopStatsStream } from './streamer';

export function setupSocketIO(io: SocketIOServer) {
  // Middleware for Authentication
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie || '';
      const sessionMatch = cookieHeader.match(/containo_session=([^;]+)/);
      const session = sessionMatch ? sessionMatch[1] : null;

      if (!session) {
        return next(new Error('Unauthorized'));
      }

      const sessionPayload = await verifySession(session);
      if (!sessionPayload) {
        return next(new Error('Invalid Session'));
      }

      next();
    } catch (err) {
      next(new Error('Authentication Error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    // console.log(`[WS] Client connected: ${socket.id}`);

    socket.on('stats:subscribe', (payload) => {
      const ids = Array.isArray(payload) ? payload : [payload];
      ids.forEach(id => {
        const room = `stats:${id}`;
        socket.join(room);
        startStatsStream(io, id);
      });
    });

    socket.on('stats:unsubscribe', (payload) => {
      const ids = Array.isArray(payload) ? payload : [payload];
      ids.forEach(id => {
        const room = `stats:${id}`;
        socket.leave(room);
        
        // If no more clients in room, stop the stream
        const clientsInRoom = io.sockets.adapter.rooms.get(room);
        if (!clientsInRoom || clientsInRoom.size === 0) {
          stopStatsStream(id);
        }
      });
    });

    socket.on('disconnect', () => {
      // Check if any rooms became empty to clean up streams
      // Socket.io automatically removes the socket from all rooms on disconnect
      // We can periodically clean up empty streams or check on disconnect
    });

    socket.on('error', (err) => {
      logger.error('WS', 'Socket error', err);
    });
  });

  // Start polling
  startSystemBroadcaster(io);
}
