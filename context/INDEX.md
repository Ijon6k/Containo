# Containo — Project Context Index

> **Auto-updated**: Last built from commit `af81c40`
> **Graph data**: `graphify-out/graph.json` (584 nodes, 942 edges, 49 communities)
> **Git hook**: Auto-updates on every commit via `graphify hook`

## Files

| File | Content |
|---|---|
| [[architecture]] | Server, Next.js, Docker socket, custom HTTP server |
| [[data-flow]] | Container monitoring pipeline, stats streaming, WebSocket broadcast |
| [[modules]] | `/lib`, `/hooks`, `/components`, `/services` breakdown |
| [[api-routes]] | REST endpoints — auth, containers, volumes, images, system |
| [[websocket]] | Socket.io events, rooms, broadcaster, streamer |
| [[auth]] | JWT auth flow, session management, zero-config secret |
| [[types]] | Core TypeScript interfaces — Container, Volume, ServiceData, ContainerStats |

## Tech Stack

- **Framework**: Next.js 16 (App Router) with custom `server.ts`
- **Runtime**: Node.js + TypeScript 5
- **Docker**: `dockerode` via Unix socket (`/var/run/docker.sock`)
- **Database**: `better-sqlite3` — file-based, zero-config (`data/containo.db`)
- **Real-time**: `socket.io` (WebSocket + polling fallback)
- **Auth**: `jose` (JWT) with auto-generated secret
- **UI**: React 19 + Tailwind CSS 4 + `framer-motion` + `lucide-react`
- **State**: `@tanstack/react-query` + `react-hook-form` + `zod`
- **Charts**: `recharts`
- **Terminal**: `xterm` + `xterm-addon-fit`

## How to Query

```
# Structural questions (imports, calls, dependencies):
graphify query "how does ContainerStats connect to the WebSocket streamer?"

# Semantic questions (architecture, flows, decisions):
read context/ corresponding file, then follow linked notes
```

## Quick Facts

- **Port**: 3611 (configurable via `PORT` env)
- **WebSocket path**: `/api/ws`
- **Docker socket**: `/var/run/docker.sock` (mounted as volume)
- **Data dir**: `./data/` (SQLite DB + JWT secret + setup flag)
- **Containo internal containers** are hidden from UI via `containo.internal=true` label
