# Technology Stack

**Analysis Date:** 2026-03-15

## Languages

**Primary:**
- TypeScript 5.7.x - Both client (`client/`) and server (`server/`) codebases
- TSX (React) - All UI components under `client/src/`

**Secondary:**
- JSON - Seed/mock data under `client/src/lib/seed/`

## Runtime

**Environment:**
- Node.js v24.13.0 (detected at analysis time)

**Package Manager:**
- pnpm (both workspaces)
- Lockfile: `client/pnpm-lock.yaml` and `server/pnpm-lock.yaml` — both present

## Frameworks

### Client (`client/`)

**Core:**
- React 19.x - UI rendering (`client/src/`)
- TanStack Router 1.132.x - File-based routing with type-safe routes (`client/src/routes/`)
- TanStack Start 1.132.x - SSR/SSG layer wrapping Vite + React Router
- Zustand 5.x - Client-side state management (`client/src/lib/stores/`)
- Tailwind CSS 4.x - Utility-first styling (configured via `@tailwindcss/vite` plugin)
- Radix UI - Headless accessible UI primitives (`@radix-ui/react-*`)
- Framer Motion 12.x - Animation library

**Build/Dev:**
- Vite 7.x - Dev server and bundler (`client/vite.config.ts`)
- `@vitejs/plugin-react` 5.x - React fast-refresh plugin
- `vite-tsconfig-paths` 6.x - Path alias resolution
- `@tanstack/router-plugin` - Route tree auto-generation

**Testing:**
- Vitest 3.x - Unit test runner (`client/package.json` script: `vitest run`)
- `@testing-library/react` 16.x - Component testing utilities
- jsdom 27.x - Browser simulation for tests

### Server (`server/`)

**Core:**
- NestJS 11.x - Modular backend framework (`server/src/`)
- `@nestjs/config` 4.x - Environment configuration (`ConfigModule`)
- `@nestjs/jwt` 11.x - JWT token support
- `@nestjs/passport` 11.x - Auth strategy middleware
- `@nestjs/swagger` 11.x - OpenAPI docs auto-generation (served at `/docs`)
- Passport + `passport-jwt` - JWT authentication strategy

**ORM / Database:**
- Prisma 7.x - ORM with generated client (`server/src/generated/prisma/`)
- `@prisma/adapter-mariadb` 7.x - MariaDB driver adapter for Prisma

**Logging:**
- Winston 3.x + `nest-winston` 1.10.x - Structured logging with Console and File transports

**Validation:**
- `class-validator` 0.15.x - DTO validation decorators
- `class-transformer` 0.5.x - DTO transformation

**Security:**
- `bcrypt` 6.x - Password hashing in `user.service.ts`
- `reflect-metadata` 0.2.x - Required by NestJS decorators

**Build/Dev:**
- NestJS CLI 11.x - Build and scaffold tooling
- `ts-jest` 29.x - TypeScript transpiler for Jest
- Prettier 3.x - Code formatting
- ESLint 9.x + `typescript-eslint` 8.x - Linting

**Testing:**
- Jest 30.x - Unit and e2e test runner
- Supertest 7.x - HTTP integration test client

## Key Dependencies

**Critical:**
- `@tanstack/react-router` - All navigation and route protection in client
- `@prisma/client` + `@prisma/adapter-mariadb` - All database access in server
- `@nestjs/jwt` + `passport-jwt` - Authentication pipeline in server
- `zustand` - Global role/toast state persisted to `localStorage` (`client/src/lib/stores/app-store.ts`)
- `qrcode` 1.5.x - QR code generation for TTE (Tanda Tangan Elektronik) signature blocks (`client/src/components/tte/TTESignatureBlock.tsx`)

**Infrastructure:**
- `rxjs` 7.x - Required by NestJS internal pipes
- `framer-motion` - UI animations (dialogs, transitions)
- `lucide-react` 0.561.x - Icon library
- `class-variance-authority` + `clsx` + `tailwind-merge` - Utility-based component variants (`client/src/components/ui/`)

## Configuration

**Environment (Server):**
- Loaded from `.env` via `@nestjs/config` (`ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' })`)
- Required variables (see `server/.env.example`):
  - `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` — MariaDB connection
  - `DATABASE_URL` — Full Prisma connection string (`mysql://...`)
  - `PORT` — Server port (default: 3000)
  - `NODE_ENV` — `development` | `production`
  - `JWT_SECRET`, `JWT_EXPIRATION` — JWT signing
  - `ALLOWED_ORIGINS` — Comma-separated CORS origins for production

**Environment (Client):**
- Vite env vars declared in `client/src/vite-env.d.ts`
- `VITE_USE_MOCK` — `true`/`1` to use local JSON seed data instead of real API (defaults to `true`)
- `VITE_API_BASE_URL` — Base URL of NestJS API for non-mock mode

**Build:**
- Client: `client/vite.config.ts` — path alias `@` → `./src`, plugins: TanStack Start, Tailwind, React, tsconfig-paths, devtools
- Server: `server/tsconfig.json` — target ES2020, CommonJS modules, decorators enabled, `outDir: ./dist`
- Prisma: `server/prisma.config.ts` — schema at `prisma/schema.prisma`, migrations at `prisma/migrations/`, URL from `DATABASE_URL`

## Platform Requirements

**Development:**
- Node.js 24.x
- pnpm (both workspaces)
- MariaDB instance accessible at `DATABASE_HOST:3306`

**Production:**
- Server: `node dist/main` (NestJS compiled output)
- Client: Vite static build (`vite build`) — deployable as static files or via TanStack Start SSR
- API versioning: URI-based, default version `v1` (`/api/v1/...`)
- Swagger UI available at `/docs`
- Health check endpoint at `/health`

---

*Stack analysis: 2026-03-15*
