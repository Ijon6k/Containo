import { NextRequest, NextResponse } from 'next/server';
import { docker } from '@/lib/docker';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action; // 'start', 'stop', 'restart', 'delete'

    const container = docker.getContainer(id);

    switch (action) {
      case 'start':
        await container.start();
        break;
      case 'stop':
        await container.stop();
        break;
      case 'restart':
        await container.restart();
        break;
      case 'delete':
        await container.remove({ force: true });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, action });
  } catch (error: any) {
    console.error(`Action failed:`, error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
