import { Server as SocketIOServer, Socket } from "socket.io";
import { verifySession } from "../auth/utils";
import { logger } from "../core/logger";
import { startSystemBroadcaster } from "./broadcaster";
import { startStatsStream, stopStatsStream } from "./streamer";

export function setupSocketIO(io: SocketIOServer) {
  // JWT auth middleware — validates containo_session cookie
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie || "";
      const sessionMatch = cookieHeader.match(/containo_session=([^;]+)/);
      const session = sessionMatch ? sessionMatch[1] : null;

      if (!session) {
        return next(new Error("Unauthorized"));
      }

      const sessionPayload = await verifySession(session);
      if (!sessionPayload) {
        return next(new Error("Invalid Session"));
      }

      next();
    } catch (_err) {
      next(new Error("Authentication Error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    logger.debug("WS", `Client connected (${io.engine.clientsCount} active)`);

    socket.on("disconnect", () => {
      logger.debug(
        "WS",
        `Client disconnected (${io.engine.clientsCount} active)`,
      );
    });

    // Subscribe to per-container stats — joins room stats:{id}
    socket.on("stats:subscribe", (payload) => {
      const ids = Array.isArray(payload) ? payload : [payload];
      ids.forEach((id) => {
        const room = `stats:${id}`;
        socket.join(room);
        startStatsStream(io, id);
      });
    });

    // Unsubscribe — stops stream if room is now empty
    socket.on("stats:unsubscribe", (payload) => {
      const ids = Array.isArray(payload) ? payload : [payload];
      ids.forEach((id) => {
        const room = `stats:${id}`;
        socket.leave(room);

        const clientsInRoom = io.sockets.adapter.rooms.get(room);
        if (!clientsInRoom || clientsInRoom.size === 0) {
          stopStatsStream(id);
        }
      });
    });

    // Tab close / network loss — stop streams where this was the last listener.
    // Uses "disconnecting" (not "disconnect") because socket.io clears rooms
    // between the two events; rooms are still populated here.
    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room.startsWith("stats:")) {
          const containerId = room.replace("stats:", "");
          const clientsInRoom = io.sockets.adapter.rooms.get(room);
          // Socket is still in room; size === 1 means "only me"
          if (clientsInRoom && clientsInRoom.size === 1) {
            stopStatsStream(containerId);
          }
        }
      }
    });

    socket.on("error", (err) => {
      logger.error("WS", "Socket error", err);
    });
  });

  // Background broadcast: system stats (2s) + container list (5s)
  startSystemBroadcaster(io);
}
