# API Routes

All routes are under `app/api/`. Auth required (JWT session cookie via `proxy.ts`) unless noted.

## Auth (`app/api/auth/`)

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/auth/setup` | Check if setup is needed (no users exist) | ❌ |
| `POST` | `/api/auth/setup` | Create first user (one-time setup) | ❌ |
| `POST` | `/api/auth/login` | Login — returns `containo_session` cookie | ❌ |
| `POST` | `/api/auth/logout` | Clear session cookie | ✅ |

## Containers (`app/api/containers/`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/containers` | List all containers |
| `POST` | `/api/containers/start` | Start container by ID |
| `POST` | `/api/containers/stop` | Stop container by ID |
| `POST` | `/api/containers/restart` | Restart container by ID |
| `GET` | `/api/containers/{id}/logs` | Get container logs |
| `POST` | `/api/containers/{id}/action` | Start/stop/restart container by ID |
| `POST` | `/api/containers/deploy` | Create container from form (single container) |
| `DELETE` | `/api/containers/{id}` | Remove container |

> Note: Stats for containers are delivered via WebSocket (`stats:update` events) — not REST. The old REST stats endpoints were removed as dead code.

## Images (`app/api/images/`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/images` | List all images |
| `POST` | `/api/images/pull` | Pull image from registry |
| `DELETE` | `/api/images/{id}` | Remove image |

## Volumes (`app/api/volumes/`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/volumes` | List all volumes |
| `POST` | `/api/volumes/create` | Create volume |
| `DELETE` | `/api/volumes/{id}` | Remove volume |
| `POST` | `/api/volumes/backup` | Backup volume (alpine helper container) |
| `POST` | `/api/volumes/restore` | Restore volume from backup |

## Compose (`app/api/compose/`)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/compose/deploy` | Deploy docker compose stack with **SSE streaming** output |

Compose deploy uses `spawn("docker", ["compose", "up", "-d"])` with real-time SSE streaming. Features:
- Path translation: `/home` ↔ `/host` for Docker daemon path resolution
- Volume path fixing: relative compose volume mounts → absolute host paths
- Carriage return collapsing: spinner output 1200+ lines → ~50 lines
- Kill support: `req.signal` + `ReadableStream.cancel()` double-safety

## File System (`app/api/fs/`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/fs` | Browse file system with `toDisplayPath()` — shows `/home/...` instead of `/host/...` |

Path translation layer: user sees `/home/pixy/...`, internally operates on `/host/pixy/...` (Docker volume mount).

## System (`app/api/system/`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/system/info` | Docker system info (daemon, version, CPU count) |
| `POST` | `/api/system/prune` | Prune unused images, volumes, networks |

## Auth Enforcement

JWT session verification is enforced on **all** `/api/*` routes via `proxy.ts` middleware — except `/api/auth/*` which remains open for login and setup. Unauthenticated API requests receive **401 Unauthorized**.

```
proxy.ts middleware
  ├── Page routes (/dashboard, /maintenance, etc.) → redirect to /login
  ├── API routes (/api/*)                        → JWT check → 401 if invalid
  └── Auth routes (/api/auth/*)                  → OPEN (login/setup)
```

## API Client

All frontend API calls go through `lib/api/client.ts` — an Axios instance:

```typescript
const apiClient = axios.create({ baseURL: '/api' });
```

Individual API modules (`container-api.ts`, `image-api.ts`, etc.) export functions that use this client.

## Error Handling

`lib/utils/api-handler.ts` provides `withErrorHandler()` — wraps API route handlers:

```typescript
export function withErrorHandler(handler: Function) {
  // try/catch → returns { error: message } with appropriate status code
}
```
