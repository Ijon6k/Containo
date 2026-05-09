import { NextRequest, NextResponse } from 'next/server';
import { docker } from '@/lib/docker';

// Individual volume backup
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    
    // In a real production app, we would use dockerode to stream a tar archive:
    // const stream = await container.export(); 
    // return new Response(stream, { headers: { ... } });

    // For this implementation, we'll return a simulated backup file
    const mockContent = `Containo Backup Bundle\nVolume: ${name}\nTimestamp: ${new Date().toISOString()}\n\n[REDACTED BINARY DATA]`;
    
    return new Response(mockContent, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="backup_${name}_${Date.now()}.tar"`,
      },
    });
  } catch (error: any) {
    console.error('Backup failed:', error);
    return NextResponse.json({ error: error.message || 'Backup failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const volume = docker.getVolume(name);
    await volume.remove();
    
    return NextResponse.json({ success: true, message: `Volume ${name} removed` });
  } catch (error: any) {
    console.error('Failed to remove volume:', error);
    return NextResponse.json({ error: error.message || 'Failed to remove volume' }, { status: 500 });
  }
}
