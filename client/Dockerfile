# client/Dockerfile — TanStack Start (SSR) + nginx reverse proxy untuk /api

FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build && test -f dist/server/server.js

FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache nginx wget \
  && mkdir -p /run/nginx

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY production-server.mjs ./production-server.mjs

COPY nginx.conf /etc/nginx/http.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
