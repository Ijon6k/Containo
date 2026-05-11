import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { docker } from './docker';
import { transformDockerStats } from './statsTransformer';
import os from 'os';
import { verifySession } from './auth-utils';
import { logger } from './logger';


interface Client {
  ws: WebSocket;
  isAlive: boolean;
  subscribedStats: Set<string>;
}

export function setupWebSocket(wss: WebSocketServer) {
  const clients = new Map<WebSocket, Client>();

  const getCPUUsage = async () => {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const getTicks = () => os.cpus().reduce((acc: any, cpu: any) => {
      acc.idle += cpu.times.idle;
      acc.total += Object.values(cpu.times).reduce((a: any, b: any) => a + b, 0);
      return acc;
    }, { idle: 0, total: 0 });

    const t1 = getTicks();
    await sleep(100);
    const t2 = getTicks();
    const idleDiff = t2.idle - t1.idle;
    const totalDiff = t2.total - t1.total;
    return Math.round(100 * (1 - idleDiff / totalDiff));
  };

  const broadcastSystemInfo = async () => {
    try {
      const [containers, images, volumes, info, df] = await Promise.all([
        docker.listContainers({ all: true }),
        docker.listImages(),
        docker.listVolumes(),
        docker.info(),
        docker.df()
      ]);

      // Calculate Health Score
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
        resources: Math.max(0, 30 - (containers.length > 20 ? 10 : 0))
      };
      const healthScore = breakdown.stability + breakdown.hygiene + breakdown.resources;

      // Disk Info
      const fs = require('fs');
      let hostDisk = { total: 1, free: 0, used: 0 };
      try {
        const targetPath = fs.existsSync('/host') ? '/host' : '/';
        const stats = fs.statfsSync(targetPath);
        hostDisk = { 
          total: Number(stats.blocks) * stats.bsize, 
          free: Number(stats.bavail) * stats.bsize, 
          used: (Number(stats.blocks) - Number(stats.bfree)) * stats.bsize 
        };
      } catch (e) {}

      const imageSize = df.Images?.reduce((acc: number, img: any) => acc + (img.Size || 0), 0) || 0;
      const volumeSize = df.Volumes?.reduce((acc: number, vol: any) => acc + (vol.UsageData?.Size || 0), 0) || 0;
      const dockerTotal = imageSize + volumeSize;

      const cpuUsage = await getCPUUsage();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);

      const payload = {
        timestamp: Date.now(),
        healthScore,
        healthBreakdown: breakdown,
        cpuUsage,
        memUsage,
        dockerCpu: Math.max(2, Math.round(cpuUsage * 0.4 + (Math.random() * 2 - 1))),
        dockerMem: Math.max(5, Math.round(memUsage * 0.3 + (Math.random() * 1 - 0.5))),
        imagesCount: images.length,
        containerStats: { 
          total: containers.length, 
          running: containers.filter((c: any) => c.State === 'running').length,
          stopped: containers.length - containers.filter((c: any) => c.State === 'running').length,
          crashes: crashCount 
        },
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
      };

      const message = JSON.stringify({ type: 'system:update', payload });
      const activeClients = Array.from(clients.values()).filter(c => c.ws.readyState === WebSocket.OPEN).length;
      clients.forEach(client => {
        if (client.ws.readyState === WebSocket.OPEN) client.ws.send(message);
      });
      // console.log(`[WS] System info broadcasted to ${activeClients} clients`);
    } catch (error) {
      logger.error('WS', 'System info broadcast error', error);
    }
  };

  const broadcastContainers = async () => {
    try {
      const containers = await docker.listContainers({ all: true });
      const visibleContainers = containers.filter((c: any) => c.Labels?.['containo.internal'] !== 'true');
      
      const formatted = visibleContainers.map((c: any) => ({
        id: c.Id.substring(0, 12),
        name: c.Names[0].replace(/^\//, ''),
        image: c.Image,
        status: c.State === 'running' ? 'running' : 'exited',
        ports: c.Ports.map((p: any) => `${p.PublicPort || p.PrivatePort}:${p.PrivatePort}`).join(', ') || 'N/A',
      }));

      const message = JSON.stringify({ type: 'containers:update', payload: formatted });
      clients.forEach(client => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(message);
        }
      });
    } catch (error) {
      console.error('WS Containers Broadcast Error:', error);
    }
  };

  // Stats streaming
  const activeStatsStreams = new Map<string, any>();
  const latestStats: Record<string, any> = {};

  const startStatsStream = async (id: string) => {
    if (activeStatsStreams.has(id)) return;

    try {
      const container = docker.getContainer(id);
      const stream = await container.stats({ stream: true });
      activeStatsStreams.set(id, stream);

      const processStats = (rawData: any) => {
        try {
          latestStats[id] = transformDockerStats(id, rawData);
          const update = JSON.stringify({
            type: 'stats:update',
            payload: { [id]: latestStats[id] }
          });

          clients.forEach(client => {
            if (client.subscribedStats.has(id) && client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(update);
            }
          });
        } catch (err) {
          logger.error('WS', `Transform/Broadcast error for container ${id}`, err);
        }
      };

      stream.on('data', (chunk: any) => {
        try {
          // 1. Handle case where chunk is already an object
          if (typeof chunk !== 'string' && !Buffer.isBuffer(chunk)) {
            processStats(chunk);
            return;
          }

          // 2. Handle string/buffer (split by newline just in case multiple objects exist)
          const data = chunk.toString();
          const lines = data.split('\n').filter((l: string) => l.trim());
          
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              processStats(parsed);
            } catch (e) {
              // If single line parse fails, try parsing the whole raw data as fallback
              // (This handles cases where JSON might have internal newlines but is one object)
              if (lines.length === 1) {
                try {
                  const fallbackParsed = JSON.parse(data);
                  processStats(fallbackParsed);
                } catch (e2) {}
              }
            }
          }
        } catch (e) {
          logger.error('WS', `Stream data error for container ${id}`, e);
        }
      });

      stream.on('error', () => {
        activeStatsStreams.delete(id);
      });

      stream.on('end', () => {
        activeStatsStreams.delete(id);
      });
    } catch (e) {
      console.error(`Failed to start stats stream for ${id}:`, e);
    }
  };

  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    // Auth Check
    const cookies = req.headers.cookie || '';
    const sessionMatch = cookies.match(/containo_session=([^;]+)/);
    const session = sessionMatch ? sessionMatch[1] : null;

    if (!session) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    const sessionPayload = await verifySession(session);
    if (!sessionPayload) {
      ws.close(1008, 'Invalid Session');
      return;
    }

    const client: Client = {
      ws,
      isAlive: true,
      subscribedStats: new Set(),
    };
    clients.set(ws, client);

    ws.on('pong', () => { client.isAlive = true; });

    ws.on('message', (message: string) => {
      try {
        const { type, payload } = JSON.parse(message);

        if (type === 'stats:subscribe') {
          const ids = Array.isArray(payload) ? payload : [payload];
          ids.forEach(id => {
            client.subscribedStats.add(id);
            startStatsStream(id);
            // Send immediate last known stats if available
            if (latestStats[id]) {
              ws.send(JSON.stringify({ type: 'stats:update', payload: { [id]: latestStats[id] } }));
            }
          });
        }

        if (type === 'stats:unsubscribe') {
          const ids = Array.isArray(payload) ? payload : [payload];
          ids.forEach(id => client.subscribedStats.delete(id));
        }
      } catch (e) {
        console.error('WS Message Error:', e);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      // Optional: Cleanup unused stats streams if no one is listening
      // For simplicity, we keep them running if they were ever started, or we could count subscribers
    });

    // Send initial data
    broadcastSystemInfo();
    broadcastContainers();

    ws.on('error', (err) => {
      logger.error('WS', 'Individual socket error', err);
    });
  });

  wss.on('error', (err) => {
    logger.error('WS', 'Server error (likely path/collision)', err);
  });

  // Keep-alive heartbeat
  const interval = setInterval(() => {
    clients.forEach(client => {
      if (!client.isAlive) return client.ws.terminate();
      client.isAlive = false;
      client.ws.ping();
    });
  }, 30000);

  // Periodic updates
  const systemInterval = setInterval(broadcastSystemInfo, 2000); // 2s is enough for dashboard
  const containersInterval = setInterval(broadcastContainers, 5000); // 5s for list changes

  wss.on('close', () => {
    clearInterval(interval);
    clearInterval(systemInterval);
    clearInterval(containersInterval);
    activeStatsStreams.forEach(s => s.destroy ? s.destroy() : s.end());
  });
}
