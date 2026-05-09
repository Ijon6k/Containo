import { NextResponse } from 'next/server';
import { docker } from '@/lib/docker';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids');
  
  if (!idsParam) {
    return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
  }

  const ids = idsParam.split(',');
  const stats: Record<string, any> = {};

  try {
    await Promise.all(ids.map(async (id) => {
      try {
        const container = docker.getContainer(id);
        const dockerStats = await container.stats({ stream: false });
        
        // Calculate metrics
        const cpuDelta = dockerStats.cpu_stats.cpu_usage.total_usage - dockerStats.precpu_stats.cpu_usage.total_usage;
        const systemDelta = dockerStats.cpu_stats.system_cpu_usage - dockerStats.precpu_stats.system_cpu_usage;
        const cpuPercentage = (cpuDelta / systemDelta) * dockerStats.cpu_stats.online_cpus * 100;

        const memoryUsage = dockerStats.memory_stats.usage;
        const memoryLimit = dockerStats.memory_stats.limit;
        const memoryPercentage = (memoryUsage / memoryLimit) * 100;

        stats[id] = {
          cpuPercentage: isNaN(cpuPercentage) ? 0 : cpuPercentage,
          memoryUsageMB: memoryUsage / (1024 * 1024),
          memoryLimitMB: memoryLimit / (1024 * 1024),
          memoryPercentage: isNaN(memoryPercentage) ? 0 : memoryPercentage,
          networkRxMB: (dockerStats.networks?.eth0?.rx_bytes || 0) / (1024 * 1024),
          networkTxMB: (dockerStats.networks?.eth0?.tx_bytes || 0) / (1024 * 1024),
          blockReadMB: (dockerStats.blkio_stats?.io_service_bytes_recursive?.[0]?.value || 0) / (1024 * 1024),
          blockWriteMB: (dockerStats.blkio_stats?.io_service_bytes_recursive?.[1]?.value || 0) / (1024 * 1024),
        };
      } catch (e) {
        console.error(`Failed to fetch stats for ${id}:`, e);
      }
    }));

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
