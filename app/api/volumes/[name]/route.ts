import { NextRequest, NextResponse } from 'next/server';
import { docker } from '@/lib/core/docker';
import { PassThrough } from 'stream';
import { withErrorHandler } from '@/lib/utils/api-handler';

// Individual volume backup
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) => {
  const { name } = await params;
  
  // 1. Ensure the helper image exists
  try {
    await docker.getImage('alpine:latest').inspect();
  } catch (e) {
    const pullStream = await docker.pull('alpine:latest');
    await new Promise((resolve, reject) => {
      docker.modem.followProgress(pullStream, (err, res) => err ? reject(err) : resolve(res));
    });
  }

  // 2. Create a helper container to access the volume
  const container = await docker.createContainer({
    Image: 'alpine:latest',
    Cmd: ['/bin/sh', '-c', 'sleep 10'], // Temporary worker
    Labels: { 'containo.internal': 'true' },
    HostConfig: {
      Binds: [`${name}:/volume_data:ro`],
    }
  });

  await container.start();

  // 2. Get the archive stream from the container
  const stream = await container.getArchive({ path: '/volume_data/.' });

  // 3. Create a PassThrough stream to manage cleanup
  const pass = new PassThrough();
  
  // Pipe the archive stream to our pass-through
  stream.pipe(pass);

  // Clean up when the stream closes
  const cleanup = async () => {
    try {
      await container.stop().catch(() => {}); // Ignore error if already stopped
      await container.remove({ force: true });
    } catch (e) {
      console.error('Failed to cleanup backup helper:', e);
    }
  };

  pass.on('close', cleanup);

  return new Response(pass as any, {
    headers: {
      'Content-Type': 'application/x-tar',
      'Content-Disposition': `attachment; filename="backup_${name}_${Date.now()}.tar"`,
    },
  });
});

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) => {
  const { name } = await params;
  const volume = docker.getVolume(name);
  
  try {
    await volume.remove({ force: true });
    return NextResponse.json({ success: true, message: `Volume ${name} removed` });
  } catch (error: any) {
    let message = error.message || 'Failed to remove volume';
    // Clean up Docker-specific error prefixes
    message = message.replace(/^.*HTTP code \d+\) conflict - /i, '');
    
    // We throw to let the error handler catch it, but we customize the status
    const err = new Error(message) as any;
    err.statusCode = error.statusCode === 409 ? 409 : 500;
    throw err;
  }
});
