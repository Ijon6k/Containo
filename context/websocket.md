# WebSocket Communication

## Connection

- **Server**: socket.io on custom HTTP server
- **Path**: `/api/ws`
- **Auth**: JWT session cookie (`containo_session`) verified via middleware

## Client Events (Browser → Server)

| Event | Payload | Purpose |
|---|---|---|
| `stats:subscribe` | `containerId` or `[ids]` | Subscribe to per-container stats stream |
| `stats:unsubscribe` | `containerId` or `[ids]` | Unsubscribe (auto-cleanup if room empty) |

## Server Events (Server → Browser)

| Event | Payload | Interval | Purpose |
|---|---|---|---|
| `system:update` | SystemInfo payload | Every 2s | CPU, RAM, Docker stats, health score, storage |
| `containers:update` | Container[] array | Every 5s | Container list with status, ports, compose info |
| `stats:update` | ContainerStats per container | Stream (on-demand) | Per-container CPU/RAM/Network/IO stats |

## `system:update` Payload

```typescript
{
  timestamp: number,
  healthScore: number,           // 0-100 (stability + hygiene + resources)
  cpuUsage: number,              // Host CPU %
  memUsage: number,              // Host RAM %
  dockerCpu: number,             // Aggregate Docker CPU %
  dockerMem: number,             // Aggregate Docker RAM %
  imagesCount: number,
  containerStats: {
    total: number,
    running: number,
    stopped: number,
    crashes: number
  },
  storage: {
    hostTotal: number,
    hostFree: number,
    dockerBytes: number,
    imagesBytes: number,
    volumesBytes: number,
    imagesGB: string,
    volumesGB: string
  },
  dockerInfo: {
    name: string,
    serverVersion: string,
    cpus: number,
    memTotal: string
  },
  healthBreakdown: {
    stability: number,           // 0-40 (penalized by exited non-zero containers)
    hygiene: number,             // 0-30 (penalized by dangling images)
    resources: number            // 0-30 (penalized by >20 containers)
  }
}
```

## Architecture: Broadcaster + Streamer

```
                    ┌─────────────┐
                    │  server.ts  │
                    │ setupSocket │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
     ┌────────────────┐      ┌──────────────────┐
     │  broadcaster   │      │    streamer      │
     │                │      │                  │
     │ System (2s)    │      │ Per-container    │
     │ Containers(5s) │      │ Docker stats     │
     │                │      │ stream on-demand │
     └───────┬────────┘      └────────┬─────────┘
             │                        │
             ▼                        ▼
     io.emit("system:    io.to("stats:{id}")
       update")            .emit("stats:update")
             │                        │
             └────────┬───────────────┘
                      ▼
              ┌───────────────┐
              │   All clients │
              └───────────────┘
```

## Disconnect Cleanup

When `socket.on("disconnect")` fires (tab close, network loss, no explicit unsubscribe):

1. Iterate all rooms the socket was in
2. For each `stats:*` room, check if room is now empty
3. If empty → `stopStatsStream(id)` — kills the Docker stats stream
4. Prevents zombie stats streams from orphaned tabs

## Idle Detection

When `io.engine.clientsCount === 0`:
- `broadcastSystemInfo` → skips all Docker API calls
- `broadcastContainers` → skips
- `stopAllStatsStreams()` → kills all stats streams

Result: zero background Docker daemon load when no browser tab is open.

## Frontend Integration

`WebSocketProvider.tsx` wraps the dashboard. The `useWS()` hook provides:

```typescript
{
  socket: Socket | null,
  isConnected: boolean,
  containers: Container[],
  systemInfo: SystemInfo | null,
  containerStats: Record<string, ContainerStats>
}
```
