# ==============================================================================
# TexLink Factory OS — Production Dockerfile for Altare App Hosting
# Multi-stage optimized build for Next.js 15 App Router & Node.js 24
# ==============================================================================

# 1. Base Image
FROM node:24-slim AS base
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install OpenSSL 3 and ca-certificates for Prisma and HTTPS outbound requests
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# 3. Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client for PostgreSQL (production target)
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/texlink?schema=public"
ENV DATABASE_URL=$DATABASE_URL
ARG DIRECT_URL="postgresql://placeholder:placeholder@localhost:5432/texlink?schema=public"
ENV DIRECT_URL=$DIRECT_URL
ARG JWT_SECRET="ci-build-time-secret-key-minimum-32-characters-entropy-check"
ENV JWT_SECRET=$JWT_SECRET
ARG ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER="true"
ENV ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER=$ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER
RUN npx prisma generate --schema=prisma/schema.postgresql.prisma

# Build Next.js application with standalone output
RUN npm run build

# 4. Production Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone Next.js server and static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

# Container Healthcheck targeting the unauthenticated /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
