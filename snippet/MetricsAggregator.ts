/**
 * MODULE: Metrics Aggregator
 * FUNCTION: Kalkulasi persentase CPU & RAM dari Docker Stream Data
 */

export const calculateUsage = (stats: any) => {
  // 1. Kalkulasi CPU Percentage
  // Rumus: (deltaUsage / deltaSystem) * totalCPUs * 100
  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
  const cpuCount = stats.cpu_stats.online_cpus || 1;
  
  const cpuPercentage = (cpuDelta / systemDelta) * cpuCount * 100.0;

  // 2. Kalkulasi Memory Usage
  // Rumus: usage / limit * 100
  const memoryUsage = stats.memory_stats.usage;
  const memoryLimit = stats.memory_stats.limit;
  const memoryPercentage = (memoryUsage / memoryLimit) * 100.0;

  return {
    cpu: Math.max(0, cpuPercentage), // Guard dari nilai negatif
    memory: memoryUsage / (1024 * 1024), // Konversi ke MB
    memoryLimit: memoryLimit / (1024 * 1024),
    memoryPercent: memoryPercentage
  };
};
