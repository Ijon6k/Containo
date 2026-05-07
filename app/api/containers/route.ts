import { NextResponse } from 'next/server';
import { docker } from '@/lib/docker';
import { Container } from '@/lib/types';

export async function GET() {
  try {
    const containers = await docker.listContainers({ all: true });
    
    const formattedContainers: Container[] = containers.map((c: any) => {
      // Get main port mapping if exists
      const ports = c.Ports.map((p: any) => `${p.PublicPort || p.PrivatePort}:${p.PrivatePort}`).join(', ') || 'N/A';
      
      return {
        id: c.Id.substring(0, 12),
        name: c.Names[0].replace(/^\//, ''),
        image: c.Image,
        status: c.State === 'running' ? 'running' : 'exited',
        ports,
        logs: [], // logs are fetched separately now
      };
    });

    return NextResponse.json(formattedContainers);
  } catch (error) {
    console.error('Failed to list containers:', error);
    return NextResponse.json({ error: 'Failed to list containers' }, { status: 500 });
  }
}
