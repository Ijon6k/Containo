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
    let action, backupFile, formData;

    if (contentType.includes('multipart/form-data')) {
      formData = await request.formData();
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

    if (action === 'import' && formData) {
      const targetVolume = formData.get('targetVolume') as string;
      
      if (backupFile && targetVolume) {
        console.log(`Smart Restore initiated for volume: ${targetVolume}`);
        
        // 1. Find all containers using this volume
        const allContainers = await docker.listContainers({ all: true });
        const usingContainers = allContainers.filter(c => 
          c.Mounts?.some(m => m.Name === targetVolume || m.Source.includes(targetVolume))
        );

        // 2. Stop running containers that use this volume
        const originallyRunning = [];
        for (const c of usingContainers) {
          if (c.State === 'running') {
            console.log(`Stopping container ${c.Id} to free up volume...`);
            const container = docker.getContainer(c.Id);
            await container.stop().catch(e => console.log(`Stop failed (maybe already stopping): ${e.message}`));
            originallyRunning.push(c.Id);
          }
        }

        try {
          // 3. Ensure the helper image exists
          try {
            await docker.getImage('alpine:latest').inspect();
          } catch (e) {
            const pullStream = await docker.pull('alpine:latest');
            await new Promise((resolve, reject) => {
              docker.modem.followProgress(pullStream, (err, res) => err ? reject(err) : resolve(res));
            });
          }

          // 4. Create and start the helper container
          const helper = await docker.createContainer({
            Image: 'alpine:latest',
            Cmd: ['/bin/sh', '-c', 'sleep 10'],
            Labels: { 'containo.internal': 'true' },
            HostConfig: {
              Binds: [`${targetVolume}:/volume_data`],
            }
          });
          await helper.start();

          try {
            const buffer = Buffer.from(await (backupFile as File).arrayBuffer());
            await helper.putArchive(buffer, { path: '/volume_data' });
          } finally {
            await helper.stop().catch(() => {});
            await helper.remove({ force: true }).catch(() => {});
          }

          // 5. Restart containers that were originally running
          for (const id of originallyRunning) {
            console.log(`Restarting container ${id}...`);
            await docker.getContainer(id).start().catch(e => console.error(`Restart failed for ${id}:`, e));
          }

          return NextResponse.json({ 
            success: true, 
            message: `Smart Restore to ${targetVolume} completed. ${originallyRunning.length} container(s) restarted.` 
          });
        } catch (error: any) {
          console.error('Smart Restore failed:', error);
          return NextResponse.json({ error: error.message || 'Restore failed' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Missing backup file or target volume' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Volume action failed:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}
