# syntax=docker/dockerfile:1
# Containo on Bun — No native modules, no transpilation, no pnpm.
# Bun runs TypeScript directly and has SQLite built-in.
# =============================================================================

# --- STAGE 1: Install ALL Dependencies (for build) ---
FROM oven/bun:1-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./

# Install ALL dependencies (including devDeps like tailwindcss) needed for build
RUN bun install --frozen-lockfile

# --- STAGE 2: Builder ---
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy full deps and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js (Bun runs TypeScript natively — no esbuild/tsx needed)
RUN bun --bun run build

# --- STAGE 3: Production Dependencies (slim) ---
FROM oven/bun:1-alpine AS prod-deps
WORKDIR /app

COPY package.json bun.lock ./

# Install only production dependencies for the runtime image
RUN bun install --frozen-lockfile --production

# --- STAGE 4: Runner ---
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3611
ENV HOSTNAME=0.0.0.0


RUN apk add --no-cache docker-cli docker-cli-compose && \
    addgroup -g 985 docker && \
    addgroup bun docker

# Copy production artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder --chown=bun:bun /app/.next/standalone ./

# Clean junk files from standalone output (keep server.ts — entry point)
RUN rm -rf graphify-out context docs Dockerfile docker-compose.yml \
    tsconfig.json tsconfig.tsbuildinfo proxy.ts \
    eslint.config.mjs postcss.config.mjs pnpm-lock.yaml pnpm-workspace.yaml \
    skills-lock.json .npmrc README.md

# Copy slim production node_modules
COPY --from=prod-deps --chown=bun:bun /app/node_modules ./node_modules

# Ensure data directory exists
RUN mkdir -p /app/data && chown bun:bun /app/data

USER bun
EXPOSE 3611

# Run directly with Bun — no tsx, no esbuild, no node-gyp rebuilds
CMD ["bun", "--bun", "server.ts"]
