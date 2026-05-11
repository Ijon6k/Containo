import { NextRequest, NextResponse } from 'next/server';
import { docker } from '@/lib/core/docker';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const container = docker.getContainer(id);

  const stream = new ReadableStream({
    async start(controller) {
      let statsStream: any;
      try {
        statsStream = await container.stats({ stream: true });
        
        statsStream.on('data', (chunk: Buffer) => {
          const statsStr = chunk.toString('utf8');
          const lines = statsStr.trim().split('\n');
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              // Calculate CPU
              const cpuDelta = data.cpu_stats.cpu_usage.total_usage - data.precpu_stats.cpu_usage.total_usage;
              const systemDelta = data.cpu_stats.system_cpu_usage - data.precpu_stats.system_cpu_usage;
              let cpuPercent = 0.0;
              if (systemDelta > 0.0 && cpuDelta > 0.0) {
                cpuPercent = (cpuDelta / systemDelta) * data.cpu_stats.online_cpus * 100.0;
              }

              // Calculate Memory
              let usedMemory = data.memory_stats.usage;
              if (data.memory_stats.stats) {
                usedMemory -= data.memory_stats.stats.cache || 0;
              }
              const limitMemory = data.memory_stats.limit;
              const memPercent = limitMemory ? (usedMemory / limitMemory) * 100.0 : 0;
              
              // Calculate Network
              let rx = 0, tx = 0;
              if (data.networks) {
                for (const eth of Object.keys(data.networks)) {
                  rx += data.networks[eth].rx_bytes;
                  tx += data.networks[eth].tx_bytes;
                }
              }

              // Calculate Block IO
              let blkRead = 0, blkWrite = 0;
              if (data.blkio_stats && data.blkio_stats.io_service_bytes_recursive) {
                for (const io of data.blkio_stats.io_service_bytes_recursive) {
                  if (io.op.toLowerCase() === 'read') blkRead += io.value;
                  if (io.op.toLowerCase() === 'write') blkWrite += io.value;
                }
              }

              const statsEvent = {
                id,
                cpuPercentage: isNaN(cpuPercent) ? 0 : Number(cpuPercent.toFixed(2)),
                memoryUsageMB: Number((usedMemory / 1024 / 1024).toFixed(2)),
                memoryLimitMB: Number((limitMemory / 1024 / 1024).toFixed(2)),
                memoryPercentage: isNaN(memPercent) ? 0 : Number(memPercent.toFixed(2)),
                networkRxMB: Number((rx / 1024 / 1024).toFixed(2)),
                networkTxMB: Number((tx / 1024 / 1024).toFixed(2)),
                blockReadMB: Number((blkRead / 1024 / 1024).toFixed(2)),
                blockWriteMB: Number((blkWrite / 1024 / 1024).toFixed(2)),
              };

              controller.enqueue(`data: ${JSON.stringify(statsEvent)}\n\n`);
            } catch (e) {
              // Ignore partial JSON parse errors
            }
          }
        });

        statsStream.on('error', (err: any) => {
          console.error('Stats stream error:', err);
          controller.error(err);
        });

        request.signal.addEventListener('abort', () => {
          if (statsStream) statsStream.destroy();
          try { controller.close(); } catch (e) {}
        });

      } catch (err) {
        controller.error(err);
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
