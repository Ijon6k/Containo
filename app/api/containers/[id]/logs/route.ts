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
        const info = await container.inspect();
        const hasTty = info.Config.Tty;
        logStream = await container.logs({ follow: true, stdout: true, stderr: true, tail: 100 });
        
        let buffer = Buffer.alloc(0);
        logStream.on('data', (chunk: Buffer) => {
          if (hasTty) {
            const lines = chunk.toString('utf8').split('\n');
            for (const line of lines) {
              if (line.trim()) {
                controller.enqueue(`data: ${JSON.stringify({ log: line })}\n\n`);
              }
            }
            return;
          }

          buffer = Buffer.concat([buffer, chunk]);
          
          while (buffer.length >= 8) {
            const type = buffer.readUInt8(0);
            // 0 = stdin, 1 = stdout, 2 = stderr
            if (type <= 2) {
              const payloadSize = buffer.readUInt32BE(4);
              if (buffer.length >= 8 + payloadSize) {
                const payload = buffer.slice(8, 8 + payloadSize);
                buffer = buffer.slice(8 + payloadSize);
                
                const lines = payload.toString('utf8').split('\n');
                for (const line of lines) {
                  if (line.trim()) {
                    controller.enqueue(`data: ${JSON.stringify({ log: line })}\n\n`);
                  }
                }
              } else {
                break; // wait for more data
              }
            } else {
              // Not a standard multiplex header, fallback to raw
              const lines = buffer.toString('utf8').split('\n');
              for (const line of lines) {
                if (line.trim()) {
                  controller.enqueue(`data: ${JSON.stringify({ log: line })}\n\n`);
                }
              }
              buffer = Buffer.alloc(0);
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
