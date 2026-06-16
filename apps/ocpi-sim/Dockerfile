FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @voltaway/core build && pnpm --filter @voltaway/ocpi-sim build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
WORKDIR /app/apps/ocpi-sim
EXPOSE 4000
CMD ["node", "dist/main.js"]
