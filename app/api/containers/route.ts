import { NextResponse } from 'next/server';
import { docker } from '@/lib/core/docker';
import { Container } from '@/lib/types';
import { withErrorHandler } from '@/lib/utils/api-handler';

export const GET = withErrorHandler(async () => {
  const containers = await docker.listContainers({ all: true });
  
  // Filter out internal helper containers
  const visibleContainers = containers.filter((c: any) => c.Labels?.['containo.internal'] !== 'true');

  const formattedContainers: Container[] = visibleContainers.map((c: any) => {
    // Get main port mapping if exists
    let ports = c.Ports.map((p: any) => `${p.PublicPort || p.PrivatePort}:${p.PrivatePort}`).join(', ') || 'N/A';
    
    const networkMode = c.HostConfig?.NetworkMode || 'default';
    if (networkMode === 'host' && ports === 'N/A') {
      ports = 'Host Mode';
    }

    const exposedPorts = c.Ports ? c.Ports.map((p: any) => p.PrivatePort) : [];

    return {
      id: c.Id.substring(0, 12),
      name: c.Names[0].replace(/^\//, ''),
      image: c.Image,
      status: c.State === 'running' ? 'running' : 'exited',
      ports,
      logs: [],
      networkMode,
      exposedPorts: Array.from(new Set(exposedPorts)) as number[],
    };
  });

  return NextResponse.json(formattedContainers);
});

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const { name, image, ports, env, volumes, restartPolicy } = body;

  // Parse ports: "8080:80" -> { "80/tcp": [{ "HostPort": "8080" }] }
  const portBindings: any = {};
  const exposedPorts: any = {};
  
  if (ports) {
    const [hostPort, containerPort] = ports.split(':');
    const cPort = containerPort || hostPort;
    const hPort = hostPort;
    exposedPorts[`${cPort}/tcp`] = {};
    portBindings[`${cPort}/tcp`] = [{ HostPort: hPort }];
  }

  // Parse env: "KEY=VALUE\nKEY2=VALUE2" -> ["KEY=VALUE", "KEY2=VALUE2"]
  const envArray = env ? env.split('\n').filter(Boolean) : [];

  // Parse volumes: "/host:/container" -> ["/host:/container"]
  const volumeArray = volumes ? volumes.split('\n').filter(Boolean) : [];

  const container = await docker.createContainer({
    Image: image || 'nginx:latest',
    name: name || undefined,
    ExposedPorts: exposedPorts,
    HostConfig: {
      PortBindings: portBindings,
      Binds: volumeArray,
      RestartPolicy: { Name: restartPolicy || 'unless-stopped' }
    },
    Env: envArray,
  });

  await container.start();

  return NextResponse.json({ 
    success: true, 
    id: container.id.substring(0, 12),
    message: 'Container created and started' 
  });
});
