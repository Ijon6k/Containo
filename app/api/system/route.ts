import { NextResponse } from 'next/server';
import { docker } from '@/lib/docker';

export async function GET() {
  try {
    const [containers, images, volumes, info, df] = await Promise.all([
      docker.listContainers({ all: true }),
      docker.listImages(),
      docker.listVolumes(),
      docker.info(),
      docker.df()
    ]);

    const total = containers.length || 0;
    const running = containers.filter((c: any) => c.State === 'running').length || 0;
    let crashCount = 0;
    
    containers.forEach((c: any) => {
      const isExited = c.State === 'exited';
      const status = c.Status || '';
      const exitCodeMatch = status.match(/Exited \((\d+)\)/);
      const exitCode = exitCodeMatch ? parseInt(exitCodeMatch[1]) : 0;
      if (isExited && exitCode !== 0) crashCount++;
    });

    const breakdown = {
      stability: Math.max(0, 40 - (crashCount * 10)),
      hygiene: Math.max(0, 30 - (images.filter((img: any) => !img.RepoTags || img.RepoTags.includes('<none>:<none>')).length * 3)),
      resources: Math.max(0, 30 - (total > 20 ? 10 : 0))
    };

    const healthScore = breakdown.stability + breakdown.hygiene + breakdown.resources;

    // Host Disk
    const { execSync } = require('child_process');
    let hostDisk = { total: 1, free: 0, used: 0 };
    try {
      const dfOutput = execSync('df -B1 / --output=size,avail,used').toString().split('\n')[1].trim().split(/\s+/);
      hostDisk = { total: parseInt(dfOutput[0]), free: parseInt(dfOutput[1]), used: parseInt(dfOutput[2]) };
    } catch (e) {}

    const imageSize = df.Images?.reduce((acc: number, img: any) => acc + (img.Size || 0), 0) || 0;
    const volumeSize = df.Volumes?.reduce((acc: number, vol: any) => acc + (vol.UsageData?.Size || 0), 0) || 0;
    const dockerTotal = imageSize + volumeSize;

    return NextResponse.json({
      healthScore,
      healthBreakdown: breakdown,
      containerStats: { total, running, stopped: total - running, crashes: crashCount },
      storage: {
        hostTotal: hostDisk.total,
        hostFree: hostDisk.free,
        hostUsed: hostDisk.used,
        systemBytes: Math.max(0, hostDisk.used - dockerTotal),
        dockerBytes: dockerTotal,
        imagesBytes: imageSize,
        volumesBytes: volumeSize,
        imagesGB: (imageSize / (1024 ** 3)).toFixed(1),
        volumesGB: (volumeSize / (1024 ** 3)).toFixed(1),
      },
      dockerInfo: {
        name: info.Name,
        serverVersion: info.ServerVersion,
        cpus: info.NCPU,
        memTotal: (info.MemTotal / (1024 ** 3)).toFixed(1),
      }
    });
  } catch (error) {
    console.error('Failed to get system info:', error);
    return NextResponse.json({ error: 'Failed to get system info' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (action === 'prune') {
      const results = await Promise.all([
        docker.pruneContainers(),
        docker.pruneImages({ filters: { dangling: { "true": true } } }),
        docker.pruneVolumes(),
        docker.pruneNetworks()
      ]);
      
      return NextResponse.json({ 
        success: true, 
        message: 'System pruned successfully',
        results 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Prune failed:', error);
    return NextResponse.json({ error: error.message || 'Prune failed' }, { status: 500 });
  }
}
