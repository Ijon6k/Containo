import { Server as SocketIOServer } from 'socket.io';
import { docker } from '../core/docker';
import { transformDockerStats } from '../services/stats.service';
import { logger } from '../core/logger';

const activeStatsStreams = new Map<string, any>();
const latestStats: Record<string, any> = {};

export const getLatestStats = () => latestStats;

export const startStatsStream = async (io: SocketIOServer, id: string) => {
  if (activeStatsStreams.has(id)) return;

  try {
    const container = docker.getContainer(id);
    const stream = await container.stats({ stream: true });
    activeStatsStreams.set(id, stream);

    const processStats = (rawData: any) => {
      try {
        latestStats[id] = transformDockerStats(id, rawData);
        // Only emit to the room for this container
        io.to(`stats:${id}`).emit('stats:update', { [id]: latestStats[id] });
      } catch (err) {
        logger.error('WS', `Transform/Broadcast error for container ${id}`, err);
      }
    };

    stream.on('data', (chunk: any) => {
      try {
        if (typeof chunk !== 'string' && !Buffer.isBuffer(chunk)) {
          processStats(chunk);
          return;
        }

        const data = chunk.toString();
        const lines = data.split('\n').filter((l: string) => l.trim());
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            processStats(parsed);
          } catch (e) {
            if (lines.length === 1) {
              try {
                const fallbackParsed = JSON.parse(data);
                processStats(fallbackParsed);
              } catch (e2) {}
            }
          }
        }
      } catch (e) {
        logger.error('WS', `Stream data error for container ${id}`, e);
      }
    });

    stream.on('error', () => stopStatsStream(id));
    stream.on('end', () => stopStatsStream(id));
  } catch (e) {
    console.error(`Failed to start stats stream for ${id}:`, e);
  }
};

export const stopStatsStream = (id: string) => {
  const stream = activeStatsStreams.get(id);
  if (stream) {
    if (stream.destroy) stream.destroy();
    else if (stream.end) stream.end();
    activeStatsStreams.delete(id);
    delete latestStats[id];
  }
};

export const stopAllStatsStreams = () => {
  if (activeStatsStreams.size === 0) return;
  
  activeStatsStreams.forEach((stream) => {
    try {
      if (stream.destroy) stream.destroy();
      else if (stream.end) stream.end();
    } catch (e) {}
  });
  activeStatsStreams.clear();
  
  // Clear all cached statistics
  Object.keys(latestStats).forEach(key => {
    delete latestStats[key];
  });
};
