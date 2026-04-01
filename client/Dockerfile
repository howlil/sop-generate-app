# Client (React + Vite) Dockerfile - Development dengan hot reload
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code untuk hot reload
COPY . .

# Expose port
EXPOSE 3000

# Start development mode dengan hot reload
# Vite HMR butuh host 0.0.0.0 dan polling di Docker
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
