import { NextRequest } from 'next/server';
import { docker } from '@/lib/docker';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const image = data.image || 'nginx:latest';

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (msg: any) => controller.enqueue(encoder.encode(JSON.stringify(msg) + '\n'));

        try {
          send({ status: 'info', message: `Checking image: ${image}` });
          
          // Pull image with progress
          const pullStream = await docker.pull(image);
          
          await new Promise((resolve, reject) => {
            docker.modem.followProgress(pullStream, 
              (err, res) => err ? reject(err) : resolve(res),
              (event) => {
                // Map Docker events to our UI format
                send({ 
                  type: 'pull',
                  id: event.id,
                  status: event.status,
                  progress: event.progress,
                  progressDetail: event.progressDetail
                });
              }
            );
          });

          send({ status: 'info', message: 'Image pulled successfully' });
          send({ status: 'info', message: 'Creating container...' });

          // Format ports safely (Support multi-port)
          const portBindings: any = {};
          const exposedPorts: any = {};
          if (data.ports) {
            const pairs = data.ports.split(',').map((p: string) => p.trim());
            pairs.forEach((pair: string) => {
              if (pair.includes(':')) {
                const [host, container] = pair.split(':');
                if (host && container) {
                  portBindings[`${container}/tcp`] = [{ HostPort: host }];
                  exposedPorts[`${container}/tcp`] = {};
                }
              }
            });
          }

          console.log('Creating container with data:', {
            Image: image,
            ExposedPorts: exposedPorts,
            Binds: data.volumes
          });

          const container = await docker.createContainer({
            Image: image,
            name: data.name || undefined,
            ExposedPorts: exposedPorts,
            HostConfig: {
              PortBindings: portBindings,
              RestartPolicy: { Name: data.restartPolicy || 'unless-stopped' },
              Binds: data.volumes?.split('\n').filter(Boolean).map((v: string) => v) || [],
              NetworkMode: data.networkMode || undefined,
              PidMode: data.pidMode || undefined,
              CapAdd: data.capAdd || undefined,
              SecurityOpt: data.securityOpt || undefined,
            },
            Env: data.env?.split('\n').filter(Boolean) || []
          });

          send({ status: 'info', message: 'Container created' });
          send({ status: 'info', message: 'Starting container...' });
          
          await container.start();
          
          send({ status: 'success', message: 'Deployment complete!', containerId: container.id });
          controller.close();
        } catch (error: any) {
          send({ status: 'error', message: error.message });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
