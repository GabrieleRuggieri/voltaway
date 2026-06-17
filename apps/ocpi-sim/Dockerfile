FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages/config ./packages/config
COPY apps/ocpi-sim ./apps/ocpi-sim
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @voltaway/ocpi-sim build

FROM node:22-alpine AS runner
RUN apk add --no-cache wget
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
WORKDIR /app/apps/ocpi-sim
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=5s --retries=6 \
  CMD wget -qO- http://127.0.0.1:4000/health || exit 1
CMD ["node", "dist/main.js"]
