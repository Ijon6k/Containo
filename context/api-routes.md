# API Routes

All routes are under `app/api/`. Auth required (JWT session cookie) unless noted.

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
| `DELETE` | `/api/containers/{id}` | Remove container |

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
| `POST` | `/api/volumes/backup` | Backup volume |
| `POST` | `/api/volumes/restore` | Restore volume from backup |

## System (`app/api/system/`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/system/info` | Docker system info (daemon, version, CPU count) |
| `POST` | `/api/system/prune` | Prune unused images, volumes, networks |

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
