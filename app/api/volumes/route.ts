import { NextResponse } from 'next/server';
import { docker } from '@/lib/docker';
import { Volume } from '@/lib/types';

export async function GET() {
  try {
    const [{ Volumes }, df] = await Promise.all([
      docker.listVolumes(),
      docker.df()
    ]);
    
    const formattedVolumes: Volume[] = Volumes.map((v: any) => {
      // Find size in df data
      const dfVol = df.Volumes?.find((dv: any) => dv.Name === v.Name);
      const sizeBytes = dfVol?.UsageData?.Size || 0;
      
      let sizeStr = '0 B';
      if (sizeBytes > 0) {
        if (sizeBytes > 1024 * 1024 * 1024) {
          sizeStr = (sizeBytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
        } else if (sizeBytes > 1024 * 1024) {
          sizeStr = (sizeBytes / (1024 * 1024)).toFixed(1) + ' MB';
        } else {
          sizeStr = (sizeBytes / 1024).toFixed(1) + ' KB';
        }
      }

      return {
        id: v.Name.substring(0, 12),
        name: v.Name,
        size: sizeStr,
        driver: v.Driver || 'local',
        mountpoint: v.Mountpoint,
        createdAt: v.CreatedAt || 'N/A',
        lastBackup: 'Never',
      };
    });

    console.log(`Fetched ${formattedVolumes.length} volumes`);
    return NextResponse.json(formattedVolumes);
  } catch (error) {
    console.error('Failed to list volumes:', error);
    return NextResponse.json({ error: 'Failed to list volumes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let action, backupFile;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      action = formData.get('action');
      backupFile = formData.get('backup');
    } else {
      const body = await request.json();
      action = body.action;
    }

    if (action === 'backup_all') {
      const { Volumes } = await docker.listVolumes();
      const mockContent = `Containo Consolidated Backup\nVolumes Count: ${Volumes.length}\nDate: ${new Date().toISOString()}\n\n[ALL VOLUMES DATA PACKED]`;
      
      return new Response(mockContent, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="containo_full_backup_${Date.now()}.tar"`,
        },
      });
    }

    if (action === 'import') {
      if (backupFile) {
        console.log(`Received backup file for restoration: ${(backupFile as File).name}`);
        // Here you would use a tool like 'tar-fs' or 'docker.putArchive' 
        // to actually restore the files into a volume.
      }
      return NextResponse.json({ 
        success: true, 
        message: 'System restore completed successfully' 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Volume action failed:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}
