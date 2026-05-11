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
      let logStream: any;
      try {
        logStream = await container.logs({ follow: true, stdout: true, stderr: true, tail: 100 });
        
        logStream.on('data', (chunk: Buffer) => {
          // A cheap way to strip Docker's 8-byte multiplexing header without a full demuxer
          // by just removing unprintable non-whitespace characters
          const payload = chunk.toString('utf8').replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');
          const lines = payload.split('\n');
          for (const line of lines) {
            if (line.trim()) {
              controller.enqueue(`data: ${JSON.stringify({ log: line })}\n\n`);
            }
          }
        });

        logStream.on('error', (err: any) => {
          console.error('Log stream error:', err);
          controller.error(err);
        });

        request.signal.addEventListener('abort', () => {
          if (logStream) logStream.destroy();
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
