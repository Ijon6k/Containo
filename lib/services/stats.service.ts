import { ContainerStats } from '../types/index';

export function transformDockerStats(id: string, dockerStats: any): ContainerStats {
  // Calculate CPU percentage
  // Formula: (cpu_delta / system_delta) * online_cpus * 100
  const cpuDelta = dockerStats.cpu_stats.cpu_usage.total_usage - dockerStats.precpu_stats.cpu_usage.total_usage;
  const systemDelta = dockerStats.cpu_stats.system_cpu_usage - dockerStats.precpu_stats.system_cpu_usage;
  const onlineCpus = dockerStats.cpu_stats.online_cpus || 1;
  
  let cpuPercentage = 0;
  if (systemDelta > 0 && cpuDelta > 0) {
    cpuPercentage = (cpuDelta / systemDelta) * onlineCpus * 100;
  }

  // Calculate Memory
  const memoryUsage = dockerStats.memory_stats.usage || 0;
  const memoryLimit = dockerStats.memory_stats.limit || 0;
  const memoryPercentage = memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0;

  // Network Stats (sum across all interfaces)
  let networkRx = 0;
  let networkTx = 0;
  
  if (dockerStats.networks) {
    Object.values(dockerStats.networks).forEach((net: any) => {
      networkRx += net.rx_bytes || 0;
      networkTx += net.tx_bytes || 0;
    });
  }

  // Block I/O Stats
  let blockRead = 0;
  let blockWrite = 0;
  
  if (dockerStats.blkio_stats?.io_service_bytes_recursive) {
    dockerStats.blkio_stats.io_service_bytes_recursive.forEach((stat: any) => {
      if (stat.op === 'Read') blockRead += stat.value;
      if (stat.op === 'Write') blockWrite += stat.value;
    });
  }

  return {
    id,
    cpuPercentage: Number(cpuPercentage.toFixed(2)),
    memoryUsageMB: Number((memoryUsage / (1024 * 1024)).toFixed(2)),
    memoryLimitMB: Number((memoryLimit / (1024 * 1024)).toFixed(2)),
    memoryPercentage: Number(memoryPercentage.toFixed(2)),
    networkRxMB: Number((networkRx / (1024 * 1024)).toFixed(2)),
    networkTxMB: Number((networkTx / (1024 * 1024)).toFixed(2)),
    blockReadMB: Number((blockRead / (1024 * 1024)).toFixed(2)),
    blockWriteMB: Number((blockWrite / (1024 * 1024)).toFixed(2)),
  };
}
