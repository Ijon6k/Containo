# Modules

## `lib/core/`

| File | Purpose |
|---|---|
| `docker.ts` | Single `dockerode` instance connected to `/var/run/docker.sock` |
| `logger.ts` | Colored console logger with `success`, `info`, `error`, `warn` methods |

## `lib/services/`

| File | Purpose |
|---|---|
| `docker-service.ts` | System health, host CPU, disk info, aggregate Docker stats, `getSystemInfo()` |
| `container-format.service.ts` | Shared `formatContainer()` — used by WebSocket broadcaster + REST API |
| `compose-yaml.service.ts` | `buildComposeYaml()` — generates docker-compose YAML from service definitions |
| `stats.service.ts` | `transformDockerStats()` — raw Docker stats stream to `ContainerStats` |
| `cli-parser.service.ts` | Parse Docker CLI commands to compose config |

## `lib/api/`

| File | Purpose |
|---|---|
| `client.ts` | Axios instance with `/api` base URL |
| `auth-api.ts` | Login, register, check setup status |
| `container-api.ts` | Container CRUD — list, start, stop, restart, logs |
| `image-api.ts` | Image list, pull, remove |
| `volume-api.ts` | Volume list, create, remove, backup, restore |
| `system-api.ts` | System info, Docker info, prune |

## `lib/ws/`

| File | Purpose |
|---|---|
| `server.ts` | `setupSocketIO()` — auth middleware, `stats:subscribe/unsubscribe`, `disconnect` |
| `broadcaster.ts` | `broadcastContainers()` every 5s, `broadcastSystemInfo()` every 2s — uses shared `getSystemInfo()` and `formatContainer()`, idle detection |
| `streamer.ts` | `startStatsStream()` / `stopStatsStream()` — per-container Docker stats streaming |

## `lib/auth/`

| File | Purpose |
|---|---|
| `utils.ts` | `getJwtSecret()` — env -> file -> auto-generate, `verifySession()` |
| `index.ts` | Re-exports |

## `lib/utils/`

| File | Purpose |
|---|---|
| `api-handler.ts` | `withErrorHandler()` — higher-order error wrapper for API routes |
| `network.ts` | Network utilities |

## `lib/types/index.ts`

Core TypeScript interfaces: [[types]]

## `hooks/`

| Hook | Purpose |
|---|---|
| `useContainers` | Container list state + CRUD via React Query |
| `useDashboardActions` | Orchestrates `useContainers` + `useStats` + `useSearch` + `useContainerActions` |
| `useContainerActions` | `toggleStatus`, `restartContainer`, `deleteContainer`, `openWebUI` — extracted action wrappers |
| `useWS` | WebSocket connection, event subscriptions (via `WebSocketProvider`) |
| `useStats` | Container CPU/RAM stats (via WS `stats:update`) |
| `useStacks` | Docker stack listing |
| `useBackupRestore` | Volume backup/restore operations |
| `useDeployment` | Docker Compose deployment from UI |
| `useImageActions` | Image pull/remove |
| `usePrune` | System prune (unused images, volumes, networks) |
| `useMetricHistory` | Historical stats data for charts |
| `useSearch` | Container/image search and filtering |
| `useAuthForm` | Login and setup form state (react-hook-form + zod) |
| `useNotifications` / `useNotify` | Toast notification system |

## `components/providers/`

| Provider | Wraps |
|---|---|
| `QueryProvider` | `@tanstack/react-query` (root layout) |
| `WebSocketProvider` | socket.io connection + `useWS` context |
| `NotificationProvider` | Toast notification context + `useNotify` |
