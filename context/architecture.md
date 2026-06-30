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

## Project Structure

```
Containo/
├── server.ts                 # Custom server (entry point)
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout (QueryProvider, Archivo font, dark theme)
│   ├── page.tsx              # Landing page
│   ├── (auth)/               # Auth pages (login, setup)
│   ├── (dashboard)/           # Dashboard pages (backups, deploy, maintenance, settings)
│   └── api/                  # API routes (auth, containers, images, system, volumes)
├── lib/                      # Core logic
│   ├── core/                 # docker.ts (dockerode), logger.ts
│   ├── api/                  # REST API client (auth-api, container-api, image-api, system-api, volume-api, client.ts)
│   ├── services/             # Business logic (docker-service, container-actions, stats, cli-parser)
│   ├── ws/                   # WebSocket (server.ts, broadcaster.ts, streamer.ts)
│   ├── auth/                 # JWT auth (utils.ts, index.ts)
│   ├── types/                # TypeScript interfaces (index.ts)
│   ├── utils/                # Utilities (api-handler.ts, network.ts)
│   └── db.ts                 # SQLite initialization
├── components/               # React components
│   ├── auth/                 # LoginForm, SetupForm
│   ├── backup/               # VolumeList, RestoreModal, RestoreProgress
│   ├── create/               # SimpleForm, ComposeBuilder, VisualizerTab
│   ├── dashboard/            # ContainerCard, ContainerListView, StatsPanel, TerminalModal, LogModal
│   ├── maintenance/          # HealthScoreCard, AutoHealToggle, PruneAction
│   ├── providers/            # NotificationProvider, QueryProvider, WebSocketProvider
│   ├── settings/             # Settings components
│   └── ui/                   # Shared UI (InfoBox, WIPWrapper)
├── hooks/                    # Custom React hooks
│   ├── useContainers.ts      # Container CRUD + state
│   ├── useDashboardActions.ts # Start/stop/restart containers
│   ├── useWebSocket.ts       # WebSocket connection
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
└── data/                     # Persistent data (SQLite, JWT secret, setup flag)
```

## Key Design Decisions

1. **Custom HTTP server** — merges Next.js + socket.io on one port (3611)
2. **SQLite (better-sqlite3)** — zero-config, file-based, portable. Student-friendly.
3. **Auto-generated JWT secret** — no setup required. Saved to `data/.jwt_secret`.
4. **Docker socket mount** — `/var/run/docker.sock` mounted as volume. No TCP Docker API needed.
5. **Standalone output** — `next.config.ts` sets `output: 'standalone'` for Docker deployment.
6. **Containo self-hiding** — internal containers labeled `containo.internal=true` are hidden from UI.
