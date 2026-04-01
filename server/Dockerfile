# Server (NestJS) Dockerfile - Development dengan hot reload
FROM node:20-alpine

# Install dependencies untuk build native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install semua dependencies (termasuk dev untuk hot reload)
RUN pnpm install

# Copy source code untuk hot reload
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Expose port
EXPOSE 3000

# Start development mode dengan hot reload
CMD ["pnpm", "start:dev", "--host", "0.0.0.0"]
