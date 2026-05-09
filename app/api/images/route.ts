import { NextResponse } from 'next/server';
import { docker } from '@/lib/docker';

export async function GET() {
  try {
    const images = await docker.listImages();
    const formattedImages = images.map((img: any) => ({
      id: img.Id.split(':')[1].substring(0, 12),
      fullId: img.Id,
      repoTags: img.RepoTags || ['<none>:<none>'],
      size: img.Size,
      created: img.Created,
      containers: img.Containers === -1 ? 0 : img.Containers
    }));

    return NextResponse.json(formattedImages);
  } catch (error: any) {
    console.error('Failed to list images:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const force = searchParams.get('force') === 'true';

    const image = docker.getImage(id);
    await image.remove({ force });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
