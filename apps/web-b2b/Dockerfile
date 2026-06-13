# Multi-stage build for the web-b2b Next.js app from the pnpm + Turborepo monorepo.
# Build context MUST be the repo root: docker build -f apps/web-b2b/Dockerfile .

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @auj/web-b2b... build
RUN pnpm --filter @auj/web-b2b build:next

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/apps/web-b2b/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-b2b/.next/static ./apps/web-b2b/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-b2b/public ./apps/web-b2b/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web-b2b/server.js"]
