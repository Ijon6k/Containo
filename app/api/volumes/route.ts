import { NextResponse } from 'next/server';
import { docker } from '@/lib/docker';
import { Volume } from '@/lib/types';

export async function GET() {
  try {
    const { Volumes } = await docker.listVolumes();
    
    const formattedVolumes: Volume[] = Volumes.map((v: any) => {
      return {
        id: v.Name.substring(0, 12),
        name: v.Name,
        size: 'Unknown', // Docker API doesn't return size easily without inspecting
        lastBackup: 'N/A', // Mocking for now since docker doesn't natively track this
      };
    });

    return NextResponse.json(formattedVolumes);
  } catch (error) {
    console.error('Failed to list volumes:', error);
    return NextResponse.json({ error: 'Failed to list volumes' }, { status: 500 });
  }
}
