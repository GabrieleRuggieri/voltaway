FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile || pnpm install
ARG NEXT_PUBLIC_API_URL=http://api.voltaway.localhost
ARG NEXT_PUBLIC_MAP_TILES_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_MAP_TILES_URL=$NEXT_PUBLIC_MAP_TILES_URL
RUN pnpm --filter @voltaway/web build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
