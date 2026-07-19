# Architecture

## Server Entry Point: `server.ts`

Containo uses a **custom Node.js HTTP server** (not `next start`), wrapping Next.js:

```
server.ts
├── Manual .env loader (fallback for @next/env issues)
├── next() app with hostname 0.0.0.0:3611
├── http.createServer() → wraps Next.js request handler
├── socket.io Server mounted at path /api/ws
├── setupSocketIO(io) — WS auth + events
└── listen() → start
```

**Why custom server?** Next.js standalone output doesn't bundle socket.io. The custom server merges HTTP + WebSocket on a single port.

## Request Pipeline

```
Browser Request
    │
    ▼
proxy.ts (Next.js middleware)
    ├── Setup check → redirect to /setup if not done
    ├── Page route check → JWT verify → redirect /login if invalid
    ├── API route check → JWT verify → 401 if invalid (/api/auth/* excluded)
    └── Auth route check → redirect to /dashboard if already logged in
    │
    ▼
Next.js App Router / API Route Handler
    │
    ▼
Docker Daemon (/var/run/docker.sock) or SQLite (data/containo.db)
```

## Project Structure

```
Containo/
├── server.ts                 # Custom server (entry point)
├── proxy.ts                  # Next.js middleware — JWT auth for pages + API
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout (QueryProvider, Archivo font, dark theme)
│   ├── page.tsx              # Landing page
│   ├── (auth)/               # Auth pages (login, setup)
│   ├── (dashboard)/           # Dashboard pages (backups, deploy, maintenance, settings)
│   └── api/                  # API routes (auth, containers, images, system, volumes, compose, fs)
├── lib/                      # Core logic
│   ├── core/                 # docker.ts (dockerode), logger.ts
│   ├── api/                  # REST API client (auth-api, container-api, image-api, system-api, volume-api, client.ts)
│   ├── services/             # Business logic (docker-service, container-actions, container-format, compose-yaml, stats, cli-parser)
│   ├── ws/                   # WebSocket (server.ts, broadcaster.ts, streamer.ts)
│   ├── auth/                 # JWT auth (utils.ts, index.ts)
│   ├── types/                # TypeScript interfaces (index.ts)
│   ├── utils/                # Utilities (api-handler.ts, network.ts)
│   └── db.ts                 # SQLite initialization
├── components/               # React components
│   ├── auth/                 # LoginForm, SetupForm
│   ├── backup/               # VolumeList, RestoreModal, RestoreProgress, RecoveryActions
│   ├── create/               # SimpleForm, ComposeBuilder, DeploymentLogs
│   │   └── compose/          # LocalStackDeployer, YamlPreview
│   ├── dashboard/            # ContainerCard, ContainerListView, ContainerGridCard, StatsPanel, TerminalModal, LogModal, SystemStats
│   ├── maintenance/          # HealthScoreCard, AutoHealToggle, PruneAction
│   ├── providers/            # NotificationProvider, QueryProvider, WebSocketProvider
│   ├── settings/             # Settings components
│   └── ui/                   # Shared UI (InfoBox, WIPWrapper)
├── hooks/                    # Custom React hooks
│   ├── useContainers.ts      # Container CRUD + state
│   ├── useDashboardActions.ts # Start/stop/restart containers
│   ├── useWebSocket.ts       # WebSocket connection (useWS)
│   ├── useStats.ts           # Container stats
│   ├── useStacks.ts          # Docker stacks
│   ├── useBackupRestore.ts   # Volume backup/restore
│   ├── useDeployment.ts      # Docker compose deploy
│   ├── useImageActions.ts    # Image management
│   ├── usePrune.ts           # Docker system prune
│   ├── useMetricHistory.ts   # Historical metrics
│   ├── useSearch.ts          # Search/filter
│   ├── useAuthForm.ts        # Login/setup form logic
│   └── useNotifications.ts   # Toast notifications
├── public/
│   └── demo/                 # Demo stack assets + PROMPT.md
└── data/                     # Persistent data (SQLite, JWT secret, setup flag)
```

## Key Design Decisions

1. **Custom HTTP server** — merges Next.js + socket.io on one port (3611)
2. **proxy.ts middleware** — centralized JWT auth for both page routes AND API routes
3. **Bun runtime + `bun:sqlite`** — Replaced Node.js 22 + better-sqlite3. Bun runs TypeScript natively, has built-in SQLite driver, and uses 45-50% less memory. Zero native module dependencies.
4. **Lazy DB initialization** — `lib/db.ts` uses Proxy pattern to defer SQLite connection until first query. Prevents build-time crashes when `data/` dir doesn't exist during `next build`.
5. **Auto-generated JWT secret** — no setup required. Saved to `data/.jwt_secret`. Cached after first read.
6. **Docker socket mount** — `/var/run/docker.sock` mounted as volume. No TCP Docker API needed.
7. **Standalone output** — `next.config.ts` sets `output: 'standalone'` for Docker deployment.
8. **Containo self-hiding** — internal containers labeled `containo.internal=true` are hidden from UI.
9. **SSE streaming for compose** — real-time `docker compose up` output via Server-Sent Events with kill support.

## Path Translation System

Docker daemon sees host filesystem, but user sees container filesystem. Translation layer:

```
User path (UI):       /home/pixy/projects/...
Container path (FS):  /host/pixy/projects/...
Host path (Docker):   /home/pixy/projects/...
```

- `toContainerPath()` — user path → container path (for FS operations from inside the container)
- `toHostPath()` — container path → host path (for Docker daemon bind mounts)
- `toDisplayPath()` — container path → user path (for file browser UI)
- `fixVolumePaths()` — transforms relative compose volume mounts to absolute host paths
