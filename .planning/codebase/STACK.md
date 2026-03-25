# Technology Stack

**Analysis Date:** 2026-03-25

## Languages

**Primary:**
- TypeScript 5.7.x - Both client (`client/tsconfig.json`) and server (`server/tsconfig.json`)

**Secondary:**
- TSX (React JSX) - All client UI components under `client/src/`

## Runtime

**Environment:**
- Node.js (no `.nvmrc` pinned; package engines not set)

**Package Manager:**
- pnpm - Used in both workspaces
- Lockfiles: `client/pnpm-lock.yaml` and `server/pnpm-lock.yaml` (both present)

## Frameworks

**Server (backend):**
- NestJS 11.x (`@nestjs/core ^11.0.1`) - REST API framework
  - `@nestjs/common`, `@nestjs/platform-express` - Core NestJS building blocks
  - `@nestjs/config ^4.0.3` - `.env` configuration loading
  - `@nestjs/swagger ^11.2.6` - OpenAPI/Swagger docs at `/docs`
  - `@nestjs/jwt ^11.0.2` + `@nestjs/passport ^11.0.5` + `passport-jwt ^4.0.1` - JWT auth infrastructure (installed but auth module not yet implemented)
  - Express (via `@nestjs/platform-express`) - HTTP transport

**Client (frontend):**
- React 19.x (`react ^19.2.0`) - UI library
- TanStack Start (`@tanstack/react-start ^1.132.0`) - Full-stack React framework (SSR-capable)
- TanStack Router (`@tanstack/react-router ^1.132.0`) - File-based routing
- Tailwind CSS 4.x (`tailwindcss ^4.1.18`) - Utility-first styling
- Vite 7.x (`vite ^7.1.7`) - Build tool and dev server

**Testing:**
- Server: Jest 30.x (`jest ^30.0.0`) + `ts-jest ^29.2.5` + `supertest ^7.0.0`
- Client: Vitest 3.x (`vitest ^3.0.5`) + `@testing-library/react ^16.2.0` + jsdom 27.x

**Build/Dev:**
- `@nestjs/cli ^11.0.0` - NestJS build tooling (`nest build`, `nest start`)
- Vite (`vite ^7.1.7`) - Client bundler
- `@tanstack/devtools-vite` - TanStack DevTools integration in dev mode

## Key Dependencies

**Critical (server):**
- `prisma ^7.5.0` + `@prisma/client ^7.5.0` - ORM for database access
- `@prisma/adapter-mariadb ^7.5.0` - MariaDB/MySQL driver adapter for Prisma
- `bcrypt ^6.0.0` - Password hashing (10 rounds salt)
- `class-validator ^0.15.1` + `class-transformer ^0.5.1` - DTO validation via decorators
- `nest-winston ^1.10.2` + `winston ^3.19.0` - Structured logging (console + file)
- `rxjs ^7.8.1` - NestJS reactive primitives

**Critical (client):**
- `zustand ^5.0.11` - Lightweight global state management (with `persist` middleware to `localStorage`)
- `@radix-ui/*` - Unstyled accessible UI primitives (accordion, dialog, dropdown-menu, label, slot, switch, alert-dialog)
- `framer-motion ^12.36.0` - Animation library
- `lucide-react ^0.561.0` - Icon set
- `qrcode ^1.5.4` - QR code generation (used in TTE signature blocks)
- `class-variance-authority ^0.7.1` + `clsx ^2.1.1` + `tailwind-merge ^2.6.0` - CVA/cn utility pattern

## Configuration

**Environment (server):**
- Loaded from `.env` via `@nestjs/config` (`ConfigModule.forRoot`)
- `.env.example` present at `server/.env.example`
- Required vars: `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_URL`, `PORT`, `NODE_ENV`, `JWT_SECRET`, `JWT_EXPIRATION`, `ALLOWED_ORIGINS`

**Environment (client):**
- Vite env vars prefixed with `VITE_`
- `.env.example` present at `client/.env.example`
- `VITE_USE_MOCK` - switches data layer between mock JSON and real API (`true` by default)
- `VITE_API_BASE_URL` - backend base URL (empty string default)

**TypeScript (server):**
- Target `ES2020`, `module: commonjs`, decorators enabled (`emitDecoratorMetadata`, `experimentalDecorators`)
- `strictNullChecks: true`, `noImplicitAny: false`

**TypeScript (client):**
- Target `ES2022`, `module: ESNext`, `jsx: react-jsx`
- Strict mode enabled; path alias `@/*` → `./src/*`

**Build:**
- Server: `server/nest-cli.json` defines `sourceRoot: src` and `deleteOutDir: true`; outputs to `dist/`
- Server: `server/prisma.config.ts` - Prisma config pointing to `prisma/schema.prisma`
- Client: `client/vite.config.ts` - plugins: TanStack Start, TanStack DevTools, React, TailwindCSS, vite-tsconfig-paths

## Platform Requirements

**Development:**
- Node.js + pnpm required
- MariaDB/MySQL database instance (host/user/password/db configurable via `.env`)
- Server dev command: `nest start --watch` (port 3000 default)
- Client dev command: `vite dev --port 3000`

**Production:**
- Server: `node dist/main` (compiled NestJS)
- Client: `vite build` + `vite preview` or static host
- No Docker or CI/CD configuration detected in repo root

---

*Stack analysis: 2026-03-25*
