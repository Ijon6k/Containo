import { createServer } from "http";
import { parse } from "url";
import fs from "fs";
import path from "path";

// Manual .env loader — fallback when @next/env fails (common in Docker standalone builds)
try {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, "utf8").split("\n");
    envLines.forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts
          .join("=")
          .trim()
          .replace(/^["']|["']$/g, "");
        if (!process.env[key.trim()]) process.env[key.trim()] = value;
      }
    });
  }
} catch (e) {
  // Non-fatal: .env loading failed, relying on env vars or auto-generated config
}

import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { setupSocketIO } from "./lib/ws/server";
import { getJwtSecret } from "./lib/auth/utils";
import { logger } from "./lib/core/logger";

// Trigger JWT secret resolution early — fails fast if production and no secret
getJwtSecret();

const port = parseInt(process.env.PORT || "3611", 10);
const hostname = "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, hostname, port, dir: process.cwd() });
const handle = app.getRequestHandler();

// Custom HTTP server merging Next.js + Socket.IO on a single port.
// Next.js standalone output doesn't bundle socket.io, so we wrap
// the Next.js handler in a Node http.Server and mount socket.io at /api/ws.
app
  .prepare()
  .then(() => {
    const httpServer = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    });

    const io = new SocketIOServer(httpServer, { path: "/api/ws" });
    setupSocketIO(io);

    httpServer.listen(port, hostname, () => {
      logger.success("SERVER", `Started custom server on ${hostname}:${port}`);
      logger.info("SERVER", `Socket.io server path: /api/ws`);
    });
  })
  .catch((err) => {
    logger.error("SERVER", "Error starting server", err);
    process.exit(1);
  });
