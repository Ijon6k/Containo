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

export const broadcastSystemInfo = async (io: SocketIOServer) => {
  // ZERO-LOAD IDLE: If no users are active, stop all background Docker streams to free RAM & CPU
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

    // BACKGROUND OPTIMIZATION: Auto-start streams for all running containers.
    // This populates `latestStats` globally, ensuring aggregate calculations
    // (Docker CPU/RAM) are instant and preventing the host monitor from freezing.
    containers
      .filter((c: any) => c.State === "running")
      .forEach((c: any) => {
        startStatsStream(io, c.Id.substring(0, 12));
      });
  } catch (error) {
    console.error("WS Containers Broadcast Error:", error);
  }
};

export function startSystemBroadcaster(io: SocketIOServer) {
  // Initial broadcast
  broadcastSystemInfo(io);
  broadcastContainers(io);

  // Set intervals
  setInterval(() => broadcastSystemInfo(io), 2000);
  setInterval(() => broadcastContainers(io), 5000);
}
