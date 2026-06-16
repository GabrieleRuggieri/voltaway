FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @voltaway/core build \
 && pnpm --filter @voltaway/ocpi build \
 && pnpm --filter @voltaway/db build \
 && pnpm --filter @voltaway/api build

FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/main.js"]
