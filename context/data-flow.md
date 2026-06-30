# Data Flow

## Container Monitoring Pipeline (Real-time)

```
Docker Daemon (/var/run/docker.sock)
    │
    ▼
dockerode (lib/core/docker.ts)
    │  docker.listContainers() — every 5s
    │  docker.getContainer(id).stats() — on-demand
    │
    ├──▶ broadcaster.ts (broadcastContainers)
    │       │  Formats containers → Container[] type
    │       │  Hides internal containers (containo.internal=true)
    │       │  Auto-starts stats streams for running containers
    │       ▼
    │    socket.io emit → "containers:update"
    │       │
    │       ▼
    │    WebSocketProvider.tsx
    │       │  useWS() hook
    │       ▼
    │    useContainers() hook
    │       │  Sets container state
    │       ▼
    │    Dashboard components
    │       ├── ContainerListView / ContainerGridView
    │       ├── ContainerCard / ContainerGridCard
    │       └── StatsPanel (CPU/RAM gauges)
    │
    └──▶ streamer.ts (startStatsStream / stopStatsStream)
            │  docker.getContainer(id).stats({stream: true})
            │  Transforms raw Docker stats → ContainerStats
            │  Emits to room "stats:{containerId}"
            ▼
         socket.io emit → "stats:update"
            │
            ▼
         useStats() hook → recharts charts
```

## System Health Pipeline (every 2s)

```
broadcaster.ts (broadcastSystemInfo)
    │  docker.listContainers() + docker.listImages() + docker.listVolumes()
    │  docker.df() + docker.info()
    │  os.cpus() → CPU usage
    │  os.totalmem() / os.freemem() → RAM usage
    │  getSystemHealth() → healthScore (0-100)
    │  getHostDiskInfo() → host storage
    │  getAggregateDockerStats() → total Docker CPU/RAM (cached 2s)
    ▼
socket.io emit → "system:update"
    │
    ▼
WebSocketProvider → useWS() → SystemStats component
```

## REST API Flow

```
React Component
    │  calls hook (e.g., useDashboardActions().startContainer())
    ▼
Hook (e.g., useDashboardActions.ts)
    │  calls apiClient from lib/api/client.ts
    │  apiClient = axios instance with /api base
    ▼
lib/api/container-api.ts
    │  POST /api/containers/start { id }
    ▼
app/api/containers/route.ts (Next.js API route)
    │  auth middleware (JWT session check)
    │  dockerode command
    ▼
Docker Daemon
```

## Websocket Room Architecture

```
Client subscribes: socket.emit("stats:subscribe", containerId)
    │
    ▼
server.ts → socket.join("stats:{containerId}")
    │  startStatsStream(io, containerId)
    ▼
streamer.ts → docker.getContainer(id).stats({stream: true})
    │  Emits "stats:update" to room "stats:{containerId}"
    ▼
Only clients in that room receive the stats update
    │
Client unsubscribes: socket.emit("stats:unsubscribe", containerId)
    │  socket.leave(room)
    │  If room empty → stopStatsStream(id) — stops Docker stats stream
```

## Zero-Load Idle Optimization

When `io.engine.clientsCount === 0` (no browser tabs open):
- `broadcastSystemInfo` skips all Docker API calls
- `broadcastContainers` skips
- `stopAllStatsStreams()` kills all Docker stats streams
- Result: zero Docker daemon load when idle
