# ── Build stage ──────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace config first for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/api/package.json packages/api/
COPY packages/web/package.json packages/web/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/api/ packages/api/
COPY packages/web/ packages/web/
COPY tsconfig.base.json ./

# Build API
RUN pnpm --filter api build

# Build landing page
RUN pnpm --filter web build

# ── Production stage ─────────────────────────────────────────
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/api/package.json packages/api/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod --filter api

# Copy built API
COPY --from=builder /app/packages/api/dist packages/api/dist

# Copy built landing page (served by nginx or static host)
COPY --from=builder /app/packages/web/dist packages/web/dist

# Non-root user
RUN addgroup -g 1001 -S appuser && adduser -S appuser -u 1001
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "packages/api/dist/index.js"]
