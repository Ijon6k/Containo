import { NextRequest, NextResponse } from 'next/server';
import { docker } from '@/lib/core/docker';
import { withErrorHandler } from '@/lib/utils/api-handler';

export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
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
});
