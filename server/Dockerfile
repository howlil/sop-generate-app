# server/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Aktifkan pnpm
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

# Copy metadata dependency beserta kebijakan build-script pnpm.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install semua dependencies (termasuk devDependencies karena NestJS butuh `@nestjs/cli` dll saat build)
RUN pnpm install --frozen-lockfile

# Copy semua source code
COPY . .

# Generate Prisma Client tidak membutuhkan koneksi database. URL dummy hanya
# berlaku pada layer build ini; migrate/start tetap memakai environment runtime.
RUN DATABASE_URL=mysql://prisma_generate:prisma_generate@127.0.0.1:3306/prisma_generate pnpm prisma generate
RUN pnpm build && test -f dist/src/main.js

# Port internal backend production. Akses publik tetap melalui frontend.
EXPOSE 3001

# Jalankan server
CMD ["pnpm", "start:prod"]
