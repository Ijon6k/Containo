import { Server as SocketIOServer } from 'socket.io';
import { docker } from '../core/docker';
import { getSystemHealth, getHostDiskInfo, getAggregateDockerStats } from '../services/docker-service';
import os from 'os';
import { logger } from '../core/logger';
import { getLatestStats, startStatsStream } from './streamer';

const getCPUUsage = async () => {
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const getTicks = () => os.cpus().reduce((acc: any, cpu: any) => {
    acc.idle += cpu.times.idle;
    acc.total += Object.values(cpu.times).reduce((a: any, b: any) => a + b, 0);
    return acc;
  }, { idle: 0, total: 0 });

  const t1 = getTicks();
  await sleep(100);
  const t2 = getTicks();
  const idleDiff = t2.idle - t1.idle;
  const totalDiff = t2.total - t1.total;
  return Math.round(100 * (1 - idleDiff / totalDiff));
};

export const broadcastSystemInfo = async (io: SocketIOServer) => {
  try {
    const [containers, images, volumes, info, df] = await Promise.all([
      docker.listContainers({ all: true }),
      docker.listImages(),
      docker.listVolumes(),
      docker.info(),
      docker.df()
    ]);

    const { healthScore, breakdown, crashCount } = await getSystemHealth(containers, images);
    const hostDisk = getHostDiskInfo();

    const imageSize = df.Images?.reduce((acc: number, img: any) => acc + (img.Size || 0), 0) || 0;
    const volumeSize = df.Volumes?.reduce((acc: number, vol: any) => acc + (vol.UsageData?.Size || 0), 0) || 0;
    const dockerTotal = imageSize + volumeSize;

    const cpuUsage = await getCPUUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);

    const runningContainers = containers.filter((c: any) => c.State === 'running');
    const { dockerCpu, dockerMem } = await getAggregateDockerStats(runningContainers, getLatestStats());

    const payload = {
      timestamp: Date.now(),
      healthScore,
      healthBreakdown: breakdown,
      cpuUsage,
      memUsage,
      dockerCpu,
      dockerMem,
      imagesCount: images.length,
      containerStats: {
        total: containers.length,
        running: runningContainers.length,
        stopped: containers.length - runningContainers.length,
        crashes: crashCount
      },
      storage: {
        hostTotal: hostDisk.total,
        hostFree: hostDisk.free,
        hostUsed: hostDisk.used,
        systemBytes: Math.max(0, hostDisk.used - dockerTotal),
        dockerBytes: dockerTotal,
        imagesBytes: imageSize,
        volumesBytes: volumeSize,
        imagesGB: (imageSize / (1024 ** 3)).toFixed(1),
        volumesGB: (volumeSize / (1024 ** 3)).toFixed(1),
      },
      dockerInfo: {
        name: info.Name,
        serverVersion: info.ServerVersion,
        cpus: info.NCPU,
        memTotal: (info.MemTotal / (1024 ** 3)).toFixed(1),
      }
    };

    io.emit('system:update', payload);
  } catch (error) {
    logger.error('WS', 'System info broadcast error', error);
  }
};

export const broadcastContainers = async (io: SocketIOServer) => {
  try {
    const containers = await docker.listContainers({ all: true });
    const visibleContainers = containers.filter((c: any) => c.Labels?.['containo.internal'] !== 'true');

    const formatted = visibleContainers.map((c: any) => ({
      id: c.Id.substring(0, 12),
      name: c.Names[0].replace(/^\//, ''),
      image: c.Image,
      status: c.State === 'running' ? 'running' : 'exited',
      ports: c.Ports.map((p: any) => `${p.PublicPort || p.PrivatePort}:${p.PrivatePort}`).join(', ') || 'N/A',
    }));

    io.emit('containers:update', formatted);

    // BACKGROUND OPTIMIZATION: Auto-start streams for all running containers.
    // This populates `latestStats` globally, ensuring aggregate calculations
    // (Docker CPU/RAM) are instant and preventing the host monitor from freezing.
    containers.filter((c: any) => c.State === 'running').forEach((c: any) => {
      startStatsStream(io, c.Id.substring(0, 12));
    });

  } catch (error) {
    console.error('WS Containers Broadcast Error:', error);
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
