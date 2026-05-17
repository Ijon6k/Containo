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
  } catch (e) { }
  return hostDisk;
};

// Cache to prevent overwhelming the Docker daemon with rapid polling
let cachedAggregateStats = {
  cpu: 0,
  mem: 0,
  lastFetch: 0
};

export const getAggregateDockerStats = async (runningContainers: any[], latestStats: Record<string, any>) => {
  const now = Date.now();
  // Return cached data if fetched within the last 2 seconds
  if (now - cachedAggregateStats.lastFetch < 2000) {
    return {
      dockerCpu: cachedAggregateStats.cpu,
      dockerMem: cachedAggregateStats.mem
    };
  }

  let totalCpu = 0;
  let totalMemRaw = 0;

  const fetchStats = async (c: any) => {
    const id = c.Id.substring(0, 12);
    if (latestStats[id]) {
      totalCpu += latestStats[id].cpuPercentage || 0;
      totalMemRaw += (latestStats[id].memoryUsageMB || 0) * 1024 * 1024;
      return;
    }
    
    try {
      const stream = await docker.getContainer(c.Id).stats({ stream: false });
      const transformed = transformDockerStats(id, stream);
      totalCpu += transformed.cpuPercentage || 0;
      totalMemRaw += (transformed.memoryUsageMB || 0) * 1024 * 1024;
    } catch (e) {
      // Ignore errors for individual containers
    }
  };

  // Run all stat fetches concurrently, max 50 to avoid daemon overload
  if (runningContainers.length < 50) {
    await Promise.all(runningContainers.map(fetchStats));
  }

  // To calculate overall dockerMem percentage relative to system memory
  const totalSystemMem = os.totalmem();
  const aggregateMemPercentage = totalSystemMem > 0 ? (totalMemRaw / totalSystemMem) * 100 : 0;

  const finalCpu = Math.min(100, Math.round(totalCpu));
  const finalMem = Math.min(100, Math.round(aggregateMemPercentage > 0 ? aggregateMemPercentage : 0));

  // Update cache
  cachedAggregateStats = {
    cpu: finalCpu,
    mem: finalMem,
    lastFetch: now
  };

  return {
    dockerCpu: finalCpu,
    dockerMem: finalMem
  };
};
