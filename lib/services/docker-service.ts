import { docker } from "../core/docker";
import { transformDockerStats } from "../services/stats.service";
import os from "os";
import fs from "fs";

// Measures host CPU usage over a 100ms interval for accuracy
export const getCPUUsage = async () => {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const getTicks = () =>
    os.cpus().reduce(
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

  const t1 = getTicks();
  await sleep(100);
  const t2 = getTicks();
  const idleDiff = t2.idle - t1.idle;
  const totalDiff = t2.total - t1.total;
  return Math.round(100 * (1 - idleDiff / totalDiff));
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

// Aggregate Docker CPU/RAM with a 2s cache to avoid overwhelming the daemon.
// Falls back to individual container stats when latestStats hasn't populated yet.
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
  if (now - cachedAggregateStats.lastFetch < 2000) {
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

// Fetch all Docker system data: containers, images, health, CPU, RAM, storage.
// Shared by WebSocket broadcaster (real-time) and REST /api/system (on-demand).
export const getSystemInfo = async (latestStats?: Record<string, any>) => {
  const [containers, images, info, df] = await Promise.all([
    docker.listContainers({ all: true }),
    docker.listImages(),
    docker.info(),
    docker.df(),
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
