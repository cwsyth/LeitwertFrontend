# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files for dependency installation
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# Install dependencies based on the preferred package manager
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder

# Build arguments for version and API URL
ARG APP_VERSION
ARG NEXT_PUBLIC_FRONTEND_API_URL

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy config files first (better layer caching)
COPY next.config.ts .
COPY tsconfig.json .
COPY tailwind.config.ts* .
COPY postcss.config.mjs* .
COPY components.json* .

# Copy source code (changes most frequently, so last)
COPY public ./public
COPY src ./src
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY hooks ./hooks
COPY types ./types

# Set environment variables for build
ENV NEXT_PUBLIC_APP_VERSION=$APP_VERSION
ENV NEXT_PUBLIC_FRONTEND_API_URL=$NEXT_PUBLIC_FRONTEND_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Build application
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Leverage Next.js output file tracing to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start server
CMD ["node", "server.js"]
