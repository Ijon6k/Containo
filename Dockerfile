# --- STAGE 1: Install Dependencies ---
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++ sqlite-dev
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifest files
COPY pnpm-lock.yaml package.json ./

# Use --ignore-scripts to avoid "approve-builds" interactive prompt during install
RUN pnpm install --frozen-lockfile --ignore-scripts

# Rebuild native modules manually for the current OS/Arch
RUN pnpm rebuild better-sqlite3 sharp cpu-features protobufjs ssh2 unrs-resolver

# --- STAGE 2: Builder ---
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++ sqlite-dev
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 1. Build Next.js (generates .next/standalone)
RUN pnpm build

# 2. Transpile server.ts to server.js using esbuild
RUN npx esbuild server.ts \
    --bundle \
    --platform=node \
    --target=node22 \
    --outfile=server.js \
    --external:next \
    --external:socket.io \
    --external:better-sqlite3 \
    --external:dockerode \
    --external:sharp \
    --external:ssh2 \
    --external:cpu-features \
    --external:protobufjs

# 3. Prune node_modules to remove devDependencies
RUN pnpm prune --prod

# --- STAGE 3: Runner ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3611
ENV HOSTNAME "0.0.0.0"

# Install minimal runtime deps
RUN apk add --no-cache libc6-compat

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy essential Next.js files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy our custom server (transpiled) and its production modules
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Ensure data directory exists and is writable
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

USER nextjs
EXPOSE 3611

# Run using standard node (no tsx/typescript overhead)
CMD ["node", "server.js"]
