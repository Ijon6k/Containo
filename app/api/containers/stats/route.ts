import { docker } from '@/lib/docker';
import { transformDockerStats } from '@/lib/statsTransformer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids');

  if (!idsParam) {
    return new Response('No IDs provided', { status: 400 });
  }

  const ids = idsParam.split(',');
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const activeStreams: any[] = [];
      const latestStats: Record<string, any> = {};

      const sendUpdate = () => {
        if (Object.keys(latestStats).length === 0) return;
        const data = JSON.stringify(latestStats);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Set up individual container streams
      ids.forEach(async (id) => {
        try {
          const container = docker.getContainer(id);
          const dockerStream = await container.stats({ stream: true });
          
          activeStreams.push(dockerStream);

          dockerStream.on('data', (chunk: Buffer) => {
            try {
              const rawData = JSON.parse(chunk.toString());
              latestStats[id] = transformDockerStats(id, rawData);
            } catch (e) {
              // Ignore parse errors for partial chunks
            }
          });

          dockerStream.on('error', (err: any) => {
            console.error(`Stream error for container ${id}:`, err);
          });
        } catch (error) {
          console.error(`Failed to start stream for container ${id}:`, error);
        }
      });

      // Periodic broadcast to client (throttled to 1s)
      const interval = setInterval(sendUpdate, 1000);

      // Keep-alive to prevent timeout
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        clearInterval(keepAlive);
        activeStreams.forEach(s => {
          if (s.destroy) s.destroy();
          else if (s.end) s.end();
        });
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

