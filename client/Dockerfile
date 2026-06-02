# client/Dockerfile

# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Aktifkan pnpm
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
# Jalankan proses build Vite
RUN pnpm build

# Stage 2: Serve dengan Nginx
FROM nginx:alpine
# Hapus default nginx index
RUN rm -rf /usr/share/nginx/html/*
# Copy hasil build Vite ke directory Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy konfigurasi custom Nginx untuk SPA Routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
