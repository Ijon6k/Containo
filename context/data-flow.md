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
    │  docker.listContainers() + docker.listImages()
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
proxy.ts middleware (Next.js)
    │  JWT session check → 401 if invalid
    │  (skipped for /api/auth/* routes)
    ▼
app/api/containers/route.ts (Next.js API route)
    │  dockerode command
    ▼
Docker Daemon
```

## Compose Deploy Flow (SSE Streaming)

```
ComposeBuilder / LocalStackDeployer (UI)
    │  User clicks "Deploy"
    ▼
useDeployment hook
    │  POST /api/compose/deploy { targetPath, yamlContent, composeFile }
    │  Sets up AbortController for kill capability
    ▼
proxy.ts → JWT check
    │
    ▼
app/api/compose/deploy/route.ts
    │  1. toContainerPath() — translate user path
    │  2. fixVolumePaths() — convert relative mounts to absolute
    │  3. Write docker-compose.yml to target dir
    │  4. spawn("docker", ["compose", "up", "-d"])
    │  5. Stream stdout via SSE (ReadableStream)
    │     └── \r collapsing: spinner lines deduplicated
    │  6. on("close") → send { type: "complete" } or { type: "error" }
    │
    ▼
DeploymentLogs component (UI)
    │  reader.read() loop — real-time log display
    │  Stop button → AbortController.abort() + req.signal
    │  Error close button ("Close & Fix")
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

### Disconnect Handler

When a client disconnects (browser tab close, network loss):

```
socket.on("disconnect") → cleanup handler
    │  Iterates socket.rooms
    │  For each stats room ("stats:*"), checks if room is now empty
    │  If empty → stopStatsStream(id) — kills Docker stats stream
    ▼
Result: no zombie stats streams after tab close without unsubscribe
```

## Zero-Load Idle Optimization

When `io.engine.clientsCount === 0` (no browser tabs open):
- `broadcastSystemInfo` skips all Docker API calls
- `broadcastContainers` skips
- `stopAllStatsStreams()` kills all Docker stats streams
- Result: zero Docker daemon load when idle
