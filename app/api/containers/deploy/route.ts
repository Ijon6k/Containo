import { NextRequest } from 'next/server';
import { docker } from '@/lib/core/docker';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const image = data.image || 'nginx:latest';

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (msg: any) => controller.enqueue(encoder.encode(JSON.stringify(msg) + '\n'));

        try {
          send({ type: 'create', message: `🔍 Initializing protocol for image: ${image}` });

          // Pull image with progress
          send({ type: 'create', message: `📥 Pulling image layers from registry...` });
          const pullStream = await docker.pull(image);

          await new Promise((resolve, reject) => {
            docker.modem.followProgress(pullStream,
              (err, res) => err ? reject(err) : resolve(res),
              (event) => {
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

          send({ type: 'create', message: '✅ Image layers synchronized.' });
          send({ type: 'create', message: '⚙️ Configuring container environment...' });

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

          // Handle advanced flags
          const hostConfig: any = {
            PortBindings: portBindings,
            RestartPolicy: { Name: data.restartPolicy || 'unless-stopped' },
            Binds: data.volumes?.split('\n').filter(Boolean).map((v: string) => v) || [],
            Privileged: data.privileged || false,
          };

          if (data.networkMode) hostConfig.NetworkMode = data.networkMode;
          if (data.pidMode) hostConfig.PidMode = data.pidMode;
          if (data.capAdd && Array.isArray(data.capAdd) && data.capAdd.length > 0) hostConfig.CapAdd = data.capAdd;
          if (data.securityOpt && Array.isArray(data.securityOpt) && data.securityOpt.length > 0) hostConfig.SecurityOpt = data.securityOpt;

          send({ type: 'create', message: ` Creating unit: ${data.name || 'anonymous-module'}` });

          const container = await docker.createContainer({
            Image: image,
            name: data.name || undefined,
            ExposedPorts: exposedPorts,
            HostConfig: hostConfig,
            Env: data.env?.split('\n').filter(Boolean) || []
          });

          send({ type: 'create', message: ' Container unit created. Initializing start sequence...' });

          await container.start();

          send({ type: 'success', message: ' Deployment complete! Unit is now operational.' });
          controller.close();
        } catch (error: any) {
          send({ type: 'error', message: ` Deployment failed: ${error.message}` });
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
