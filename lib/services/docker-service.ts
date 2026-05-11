import { docker } from '../core/docker';
import { transformDockerStats } from '../services/stats.service';
import os from 'os';
import fs from 'fs';

export const getSystemHealth = async (containers: any[], images: any[]) => {
  let crashCount = 0;
  containers.forEach((c: any) => {
    const isExited = c.State === 'exited';
    const status = c.Status || '';
    const exitCodeMatch = status.match(/Exited \((\d+)\)/);
    const exitCode = exitCodeMatch ? parseInt(exitCodeMatch[1]) : 0;
    if (isExited && exitCode !== 0) crashCount++;
  });

  const breakdown = {
    stability: Math.max(0, 40 - (crashCount * 10)),
    hygiene: Math.max(0, 30 - (images.filter((img: any) => !img.RepoTags || img.RepoTags.includes('<none>:<none>')).length * 3)),
    resources: Math.max(0, 30 - (containers.length > 20 ? 10 : 0))
  };
  const healthScore = breakdown.stability + breakdown.hygiene + breakdown.resources;

  return { healthScore, breakdown, crashCount };
};

export const getHostDiskInfo = () => {
  let hostDisk = { total: 1, free: 0, used: 0 };
  try {
    const targetPath = fs.existsSync('/host') ? '/host' : '/';
    const stats = fs.statfsSync(targetPath);
    hostDisk = { 
      total: Number(stats.blocks) * stats.bsize, 
      free: Number(stats.bavail) * stats.bsize, 
      used: (Number(stats.blocks) - Number(stats.bfree)) * stats.bsize 
    };
  } catch (e) {}
  return hostDisk;
};

// Calculates aggregate Docker CPU & Mem based on streamed latestStats or fallback
export const getAggregateDockerStats = async (runningContainers: any[], latestStats: Record<string, any>) => {
  let totalCpu = 0;
  let totalMem = 0;

  for (const c of runningContainers) {
    const id = c.Id.substring(0, 12);
    // If we have latestStats from WS stream, use them
    if (latestStats[id]) {
      totalCpu += latestStats[id].cpuPercentage || 0;
      totalMem += (latestStats[id].memoryPercentage || 0); // Convert to aggregate memory percentage
    } else {
      // If no active stream, optionally we could perform a synchronous fetch. 
      // To prevent CPU spikes, we just skip it or perform a single fetch if really needed.
      // For now, let's pull it if missing to ensure accurate aggregate, 
      // but only if the container count isn't overwhelmingly high.
      try {
        if (runningContainers.length < 50) {
           const stream = await docker.getContainer(c.Id).stats({ stream: false });
           const transformed = transformDockerStats(id, stream);
           totalCpu += transformed.cpuPercentage || 0;
           totalMem += (transformed.memoryPercentage || 0);
        }
      } catch (e) {}
    }
  }

  // To calculate overall dockerMem percentage relative to system memory
  const totalSystemMem = os.totalmem();
  const memUsageRaw = runningContainers.reduce((acc, c) => {
    const id = c.Id.substring(0, 12);
    if (latestStats[id]) return acc + (latestStats[id].memoryUsageMB * 1024 * 1024);
    return acc;
  }, 0);

  const aggregateMemPercentage = totalSystemMem > 0 ? (memUsageRaw / totalSystemMem) * 100 : 0;

  return {
    dockerCpu: Math.min(100, Math.round(totalCpu)),
    // if memUsageRaw is calculated, use it, else use 0
    dockerMem: Math.min(100, Math.round(aggregateMemPercentage > 0 ? aggregateMemPercentage : 0))
  };
};
