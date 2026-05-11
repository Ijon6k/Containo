# --- STAGE 1: Dependencies ---
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++ sqlite-dev
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm rebuild better-sqlite3 sharp cpu-features protobufjs ssh2 unrs-resolver

# --- STAGE 2: Builder ---
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN pnpm build
RUN npx esbuild server.ts --bundle --platform=node --target=node22 --outfile=server.js \
    --external:next --external:better-sqlite3 --external:dockerode --external:sharp \
    --external:ssh2 --external:cpu-features --external:protobufjs --external:unrs-resolver

# --- STAGE 3: Production Dependencies (The Stability Fix) ---
FROM node:22-alpine AS prod-deps
RUN apk add --no-cache libc6-compat python3 make g++ sqlite-dev
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
RUN pnpm rebuild better-sqlite3 sharp cpu-features protobufjs ssh2 unrs-resolver

# --- STAGE 4: Runner ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3611
ENV HOSTNAME "0.0.0.0"

RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy clean production node_modules
COPY --from=prod-deps /app/node_modules ./node_modules
# Copy application build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data
USER nextjs
EXPOSE 3611

CMD ["node", "server.js"]
