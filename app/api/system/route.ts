import { NextResponse } from 'next/server';
import { docker } from '@/lib/core/docker';
import { withErrorHandler } from '@/lib/utils/api-handler';
import { getSystemHealth, getHostDiskInfo, getAggregateDockerStats } from '@/lib/services/docker-service';
import os from 'os';

export const dynamic = 'force-dynamic';

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

export const GET = withErrorHandler(async () => {
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
  const { dockerCpu, dockerMem } = await getAggregateDockerStats(runningContainers, {});

  return NextResponse.json({
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
  });
});

export const POST = withErrorHandler(async (request: Request) => {
  const { action } = await request.json();
  
  if (action === 'prune') {
    const results = await Promise.all([
      docker.pruneContainers(),
      docker.pruneImages(),
      docker.pruneVolumes(),
      docker.pruneNetworks()
    ]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'System pruned successfully',
      results 
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
});
