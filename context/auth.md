# Authentication

## JWT Auth Flow

```
1. First Run → No users in DB → GET /api/auth/setup → shows SetupForm
2. User creates account → POST /api/auth/setup → hashes password (bcryptjs) → saves to SQLite
3. User logs in → POST /api/auth/login → verifies password → creates JWT → sets cookie
4. JWT cookie: containo_session = <jwt_token>
5. All subsequent requests include cookie → auth middleware verifies JWT
```

## Middleware: `proxy.ts`

Next.js middleware that enforces auth at the edge (before route handlers run):

```
proxy.ts request pipeline:
  1. Setup check → redirect to /setup if not done
  2. Page routes (/dashboard, /, etc.)   → JWT check → redirect /login
  3. API routes (/api/* except /api/auth) → JWT check → 401 Unauthorized
  4. Auth routes (/api/auth/*)            → OPEN (no check)
  5. Login/Setup pages                    → redirect /dashboard if already logged in
```

**Matcher**: All paths except `_next/static`, `_next/image`, `favicon.ico`, `logo/`, `asset/`.

## Secret Management (`lib/auth/utils.ts`)

Three-tier priority system (zero-config):

```typescript
getJwtSecret():
  1. process.env.JWT_SECRET           // Explicit env var (production)
  2. data/.jwt_secret file             // Persisted auto-generated secret
  3. Auto-generate + save to file      // First run, zero-config
```

Uses `randomBytes(32)` → hex string → saved to `data/.jwt_secret`.

**Caching**: `getJwtSecret()` result is cached after first read to avoid re-encoding on every `verifySession()` call (previously re-read the file on every request).

## Session Verification

- JWT signed with HS256 via `jose` library
- Cookie name: `containo_session`
- WebSocket auth reads cookie from `socket.request.headers.cookie`
- Session payload: `{ userId: number }`

## Password Storage

- `bcryptjs` with auto-generated salt
- Stored in SQLite `users` table:
  - `id` (INTEGER PRIMARY KEY)
  - `username` (TEXT UNIQUE)
  - `password` (TEXT — bcrypt hash)
  - `created_at` (DATETIME)

## Setup Detection

- `GET /api/auth/setup` checks if any users exist in SQLite
- Also checks `data/.setup_done` flag file (self-healing)
- If users exist but flag file missing → auto-creates flag (self-healing)

## Security Notes

- Secret auto-generated on first run if no `JWT_SECRET` env var
- **API routes now JWT-protected** via `proxy.ts` middleware (was previously open)
- Server binds to `0.0.0.0:3611` — accessible from network, not just localhost
- Docker socket access = root-level host access — defense in depth essential
- No API key or external auth service needed — fully self-contained
