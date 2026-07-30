import { Server as SocketIOServer } from "socket.io";
import { docker } from "../core/docker";
import { getSystemInfo } from "../services/docker-service";
import { logger } from "../core/logger";
import {
  getLatestStats,
  startStatsStream,
  stopAllStatsStreams,
} from "./streamer";
import { formatContainer } from "../services/container-format.service";

// Broadcasts host + Docker system stats every 2s.
// Skips all work when no clients are connected (idle optimization).
export const broadcastSystemInfo = async (io: SocketIOServer) => {
  if (io.engine.clientsCount === 0) {
    stopAllStatsStreams();
    return;
  }

  try {
    const payload = await getSystemInfo(getLatestStats());
    io.emit("system:update", payload);
  } catch (error) {
    logger.error("WS", "System info broadcast error", error);
  }
};

// Broadcasts container list every 5s. Also auto-starts stats streams
// for all running containers to keep the aggregate Docker CPU/RAM
// metrics populated and instant.
export const broadcastContainers = async (io: SocketIOServer) => {
  if (io.engine.clientsCount === 0) {
    return;
  }

  try {
    const containers = await docker.listContainers({ all: true });
    const visibleContainers = containers.filter(
      (c: any) => c.Labels?.["containo.internal"] !== "true",
    );

    const formatted = visibleContainers.map(formatContainer);
    io.emit("containers:update", formatted);

    // Fire-and-forget: start stats streams for all running containers.
    // Calls are no-ops if a stream already exists for that container.
    containers
      .filter((c: any) => c.State === "running")
      .forEach((c: any) => {
        startStatsStream(io, c.Id.substring(0, 12));
      });
  } catch (error) {
    logger.error("WS", "Container broadcast error", error);
  }
};

// Kick off the two broadcast loops with an initial immediate run.
export function startSystemBroadcaster(io: SocketIOServer) {
  broadcastSystemInfo(io);
  broadcastContainers(io);

  setInterval(() => broadcastSystemInfo(io), 1000); // System: real-time every 1s
  setInterval(() => broadcastContainers(io), 5000); // Containers: every 5s
}
