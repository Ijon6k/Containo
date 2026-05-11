import { createServer } from 'http';
import { parse } from 'url';
import fs from 'fs';
import path from 'path';

// Manual .env loader as fallback for @next/env issues
try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    envLines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) process.env[key.trim()] = value;
      }
    });
  }
} catch (e) {
  console.error('[DEBUG] Failed to load .env manually:', e);
}


import next from 'next';
import { WebSocketServer } from 'ws';
import { setupWebSocket } from './lib/ws-handler';
import { getJwtSecret } from './lib/auth-utils';
import { logger } from './lib/logger';


// Early security check & initialization
getJwtSecret();

const port = parseInt(process.env.PORT || '3611', 10);
const hostname = '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, hostname, port, dir: process.cwd() });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server: httpServer, path: '/api/ws' });
  setupWebSocket(wss);

  httpServer.listen(port, hostname, () => {
    logger.success('SERVER', `Started custom server on ${hostname}:${port}`);
    logger.info('SERVER', `WebSocket server path: /api/ws`);
  });
}).catch((err) => {
  logger.error('SERVER', 'Error starting server', err);
  process.exit(1);
});

