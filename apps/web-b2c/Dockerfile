# Multi-stage build for the web-b2c Next.js app from the pnpm + Turborepo monorepo.
# Build context MUST be the repo root: docker build -f apps/web-b2c/Dockerfile .

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# ---- install + build ----
FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
# Build workspace deps (tsc) then the Next standalone bundle.
RUN pnpm --filter @auj/web-b2c... build
RUN pnpm --filter @auj/web-b2c build:next

# ---- runtime ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Standalone output preserves the monorepo layout under .next/standalone.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-b2c/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-b2c/.next/static ./apps/web-b2c/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-b2c/public ./apps/web-b2c/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web-b2c/server.js"]
