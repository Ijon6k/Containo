import { Server as SocketIOServer } from "socket.io";
import { docker } from "../core/docker";
import { transformDockerStats } from "../services/stats.service";
import { logger } from "../core/logger";

// Module-level state: active Docker stats streams and latest stats cache.
// The cache is polled by getSystemInfo() for aggregate Docker CPU/RAM.
const activeStatsStreams = new Map<string, any>();
const latestStats: Record<string, any> = {};

export const getLatestStats = () => latestStats;

// Starts a Docker stats stream for a container. Idempotent — if a stream
// already exists for this ID, returns immediately. Double-checks after
// the async gap to prevent concurrent calls from creating duplicates.
export const startStatsStream = async (io: SocketIOServer, id: string) => {
  if (activeStatsStreams.has(id)) return;

  try {
    const container = docker.getContainer(id);
    const stream = await container.stats({ stream: true });

    // Race guard: a concurrent call may have beaten us to it
    if (activeStatsStreams.has(id)) {
      (stream as any).destroy();
      return;
    }

    activeStatsStreams.set(id, stream);

    const processStats = (rawData: any) => {
      try {
        latestStats[id] = transformDockerStats(id, rawData);
        io.to(`stats:${id}`).emit("stats:update", { [id]: latestStats[id] });
      } catch (err) {
        logger.error(
          "WS",
          `Transform/Broadcast error for container ${id}`,
          err,
        );
      }
    };

    // Dockerode stats stream delivers chunks in three forms:
    //   1. Plain object (pre-parsed by Dockerode) → process directly
    //   2. String (raw chunk) → split newline-delimited JSON
    //   3. Buffer (binary) → convert to string and parse
    stream.on("data", (chunk: any) => {
      try {
        if (typeof chunk !== "string" && !Buffer.isBuffer(chunk)) {
          processStats(chunk);
          return;
        }

        const data = chunk.toString();
        const lines = data.split("\n").filter((l: string) => l.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            processStats(parsed);
          } catch (_e) {
            // Single-line fallback: the entire chunk may be one JSON object
            if (lines.length === 1) {
              try {
                const fallbackParsed = JSON.parse(data);
                processStats(fallbackParsed);
              } catch {}
            }
          }
        }
      } catch (e) {
        logger.error("WS", `Stream data error for container ${id}`, e);
      }
    });

    // Auto-cleanup: destroy/end events stop the stream and remove cache entry
    stream.on("error", () => stopStatsStream(id));
    stream.on("end", () => stopStatsStream(id));
  } catch (e) {
    logger.error("WS", `Failed to start stats stream for container ${id}`, e);
  }
};

// Stops a single stats stream and removes its cached data.
// Safe to call on IDs that don't have an active stream.
export const stopStatsStream = (id: string) => {
  const stream = activeStatsStreams.get(id);
  if (stream) {
    if (stream.destroy) stream.destroy();
    else if (stream.end) stream.end();
    activeStatsStreams.delete(id);
    delete latestStats[id];
  }
};

// Stops all active stats streams — used when all clients disconnect
// (idle optimization) to free Docker daemon resources.
export const stopAllStatsStreams = () => {
  if (activeStatsStreams.size === 0) return;

  activeStatsStreams.forEach((stream) => {
    try {
      if (stream.destroy) stream.destroy();
      else if (stream.end) stream.end();
    } catch {}
  });
  activeStatsStreams.clear();

  Object.keys(latestStats).forEach((key) => {
    delete latestStats[key];
  });
};
