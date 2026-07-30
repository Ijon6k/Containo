import { docker } from "../core/docker";
import { transformDockerStats } from "../services/stats.service";
import os from "os";
import fs from "fs";

let prevCpuTicks: { idle: number; total: number } | null = null;

// Measures host CPU usage using continuous tick deltas across broadcast intervals (100% accurate host matching)
export const getCPUUsage = async () => {
  const getTicks = () => {
    try {
      const statPath = fs.existsSync("/proc/stat")
        ? "/proc/stat"
        : fs.existsSync("/host/proc/stat")
          ? "/host/proc/stat"
          : null;
      if (statPath) {
        const firstLine = fs.readFileSync(statPath, "utf8").split("\n")[0];
        const parts = firstLine.trim().split(/\s+/).slice(1).map(Number);
        const idle = parts[3] + (parts[4] || 0);
        const total = parts.reduce((a, b) => a + b, 0);
        return { idle, total };
      }
    } catch (e) {}

    return os.cpus().reduce(
      (acc: any, cpu: any) => {
        acc.idle += cpu.times.idle;
        acc.total += Object.values(cpu.times).reduce(
          (a: any, b: any) => a + b,
          0,
        );
        return acc;
      },
      { idle: 0, total: 0 },
    );
  };

  const curr = getTicks();
  if (!prevCpuTicks) {
    prevCpuTicks = curr;
    await new Promise((r) => setTimeout(r, 100));
    const t2 = getTicks();
    const idleDiff = t2.idle - curr.idle;
    const totalDiff = t2.total - curr.total;
    prevCpuTicks = t2;
    return totalDiff > 0
      ? Math.min(100, Math.max(0, Math.round(100 * (1 - idleDiff / totalDiff))))
      : 0;
  }

  const idleDiff = curr.idle - prevCpuTicks.idle;
  const totalDiff = curr.total - prevCpuTicks.total;
  prevCpuTicks = curr;

  if (totalDiff <= 0) return 0;
  const usage = Math.round(100 * (1 - idleDiff / totalDiff));
  return Math.min(100, Math.max(0, usage));
};

// Health score (0-100): stability (crashes), hygiene (dangling images), resources (container count)
export const getSystemHealth = async (containers: any[], images: any[]) => {
  let crashCount = 0;
  containers.forEach((c: any) => {
    const isExited = c.State === "exited";
    const status = c.Status || "";
    const exitCodeMatch = status.match(/Exited \((\d+)\)/);
    const exitCode = exitCodeMatch ? parseInt(exitCodeMatch[1]) : 0;
    if (isExited && exitCode !== 0) crashCount++;
  });

  const breakdown = {
    stability: Math.max(0, 40 - crashCount * 10),
    hygiene: Math.max(
      0,
      30 -
        images.filter(
          (img: any) => !img.RepoTags || img.RepoTags.includes("<none>:<none>"),
        ).length *
          3,
    ),
    resources: Math.max(0, 30 - (containers.length > 20 ? 10 : 0)),
  };
  const healthScore =
    breakdown.stability + breakdown.hygiene + breakdown.resources;

  return { healthScore, breakdown, crashCount };
};

// Reads host disk from /host mount point (or / on bare metal)
export const getHostDiskInfo = () => {
  let hostDisk = { total: 1, free: 0, used: 0 };
  try {
    const targetPath = fs.existsSync("/host") ? "/host" : "/";
    const stats = fs.statfsSync(targetPath);
    hostDisk = {
      total: Number(stats.blocks) * stats.bsize,
      free: Number(stats.bfree) * stats.bsize,
      used: (Number(stats.blocks) - Number(stats.bfree)) * stats.bsize,
    };
  } catch (e) {}
  return hostDisk;
};

// Aggregate Docker CPU/RAM with an 800ms cache threshold for smooth 1s real-time updates.
let cachedAggregateStats = {
  cpu: 0,
  mem: 0,
  lastFetch: 0,
};

export const getAggregateDockerStats = async (
  runningContainers: any[],
  latestStats: Record<string, any>,
) => {
  const now = Date.now();
  if (now - cachedAggregateStats.lastFetch < 800) {
    return {
      dockerCpu: cachedAggregateStats.cpu,
      dockerMem: cachedAggregateStats.mem,
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

    // Fallback: fetch a one-shot stats snapshot if cache is cold
    try {
      const stream = await docker.getContainer(c.Id).stats({ stream: false });
      const transformed = transformDockerStats(id, stream);
      totalCpu += transformed.cpuPercentage || 0;
      totalMemRaw += (transformed.memoryUsageMB || 0) * 1024 * 1024;
    } catch (e) {
      // Ignore errors for individual containers
    }
  };

  // Only parallelize if <50 containers (avoids thundering herd)
  if (runningContainers.length < 50) {
    await Promise.all(runningContainers.map(fetchStats));
  }

  const totalSystemMem = os.totalmem();
  const aggregateMemPercentage =
    totalSystemMem > 0 ? (totalMemRaw / totalSystemMem) * 100 : 0;

  const finalCpu = Math.min(100, Number(totalCpu.toFixed(1)));
  const finalMem = Math.min(
    100,
    Number(
      (aggregateMemPercentage > 0 ? aggregateMemPercentage : 0).toFixed(1),
    ),
  );

  cachedAggregateStats = {
    cpu: finalCpu,
    mem: finalMem,
    lastFetch: now,
  };

  return {
    dockerCpu: finalCpu,
    dockerMem: finalMem,
  };
};

// Cache docker.df() results for 30s as disk usage doesn't change every 2s
let cachedDf = { data: null as any, lastFetch: 0 };
const getCachedDf = async () => {
  const now = Date.now();
  if (cachedDf.data && now - cachedDf.lastFetch < 30000) {
    return cachedDf.data;
  }
  try {
    const data = await docker.df();
    cachedDf = { data, lastFetch: now };
    return data;
  } catch (err) {
    return cachedDf.data || { Images: [], Volumes: [] };
  }
};

// Fetch all Docker system data: containers, images, health, CPU, RAM, storage.
// Shared by WebSocket broadcaster (real-time) and REST /api/system (on-demand).
export const getSystemInfo = async (latestStats?: Record<string, any>) => {
  const [containers, images, info, df] = await Promise.all([
    docker.listContainers({ all: true }),
    docker.listImages(),
    docker.info(),
    getCachedDf(),
  ]);

  const { healthScore, breakdown, crashCount } = await getSystemHealth(
    containers,
    images,
  );
  const hostDisk = getHostDiskInfo();

  const imageSize =
    df.Images?.reduce((acc: number, img: any) => acc + (img.Size || 0), 0) || 0;
  const volumeSize =
    df.Volumes?.reduce(
      (acc: number, vol: any) => acc + (vol.UsageData?.Size || 0),
      0,
    ) || 0;
  const dockerTotal = imageSize + volumeSize;

  const cpuUsage = await getCPUUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);

  const runningContainers = containers.filter(
    (c: any) => c.State === "running",
  );
  const { dockerCpu, dockerMem } = await getAggregateDockerStats(
    runningContainers,
    latestStats || {},
  );

  return {
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
      crashes: crashCount,
    },
    storage: {
      hostTotal: hostDisk.total,
      hostFree: hostDisk.free,
      hostUsed: hostDisk.used,
      systemBytes: Math.max(0, hostDisk.used - dockerTotal),
      dockerBytes: dockerTotal,
      imagesBytes: imageSize,
      volumesBytes: volumeSize,
      imagesGB: (imageSize / 1024 ** 3).toFixed(1),
      volumesGB: (volumeSize / 1024 ** 3).toFixed(1),
    },
    dockerInfo: {
      name: info.Name,
      serverVersion: info.ServerVersion,
      cpus: info.NCPU,
      memTotal: (info.MemTotal / 1024 ** 3).toFixed(1),
    },
  };
};
