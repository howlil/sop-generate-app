# server/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Aktifkan pnpm
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

# Copy file dependency
COPY package.json pnpm-lock.yaml ./

# Install semua dependencies (termasuk devDependencies karena NestJS butuh `@nestjs/cli` dll saat build)
RUN pnpm install --frozen-lockfile

# Copy semua source code
COPY . .

# Generate Prisma Client & Build Aplikasi
RUN pnpm prisma generate
RUN pnpm build && test -f dist/src/main.js

# Expose port yang digunakan backend
EXPOSE 3000

# Jalankan server
CMD ["pnpm", "start:prod"]
