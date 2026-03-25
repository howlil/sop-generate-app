# Architecture

## Pattern
Monorepo with two independent applications:
- `server/` — NestJS REST API (Clean Architecture / Layered)
- `client/` — React SPA (file-based routing, client-side-only for now)

## Server Architecture

### Pattern: Clean Architecture (Layered)
```
Request → Controller → Service → Repository → Prisma → PostgreSQL
```

### Layers

**Controller** (`src/modules/{domain}/controller/`)
- Handles HTTP, validates input via DTOs
- Delegates all logic to Service
- No business logic

**Service** (`src/modules/{domain}/service/`)
- Core business logic
- Throws NestJS HTTP exceptions (`NotFoundException`, `ConflictException`)
- Uses Repository interface (not concrete implementation)

**Repository** (`src/modules/{domain}/repository/`)
- Interface (`*.repository.interface.ts`) defines contract — uses `any` types
- Concrete class (`*.repository.ts`) implements interface via PrismaService
- Pattern: `select` projections to strip sensitive fields (e.g. password)

**Common** (`src/common/`)
- `prisma/` — PrismaModule + PrismaService (global)
- `filters/` — GlobalExceptionFilter (catch-all, formats error JSON)
- `interceptors/` — ResponseInterceptor (wraps success responses)
- `logger/` — Winston logger module
- `dto/` — ApiResponseDto, PaginationDto (shared)
- `repositories/` — IBaseRepository interface

### Entry Point
`src/main.ts` — bootstraps NestJS, configures:
- Global prefix: `api`
- URI versioning (default v1) → routes: `/api/v1/...`
- ValidationPipe (whitelist, forbidNonWhitelisted, transform)
- ResponseInterceptor + GlobalExceptionFilter globally
- CORS (wildcard in dev, env-configured in prod)
- Swagger at `/docs`

### Modules
- `AppModule` → imports ConfigModule, PrismaModule, LoggerModule, UsersModule, PostsModule, HealthModule
- Each domain module is self-contained (controller + service + repository + DTOs)

## Client Architecture

### Pattern: File-based routing (TanStack Router), feature-by-role
```
Route file → Hook → Store (Zustand) → Seed JSON data
```

### Key Layers

**Routes** (`src/routes/`)
- File-based routing via TanStack Router
- Route filenames encode role + page: `tim-penyusun.daftar-sop.tsx`
- Auth guard via `requireRoleBeforeLoad()` in `beforeLoad`
- Auto-generated `routeTree.gen.ts` — never edit manually

**Hooks** (`src/hooks/`)
- Thin orchestration layer per feature
- Reads/writes Zustand stores; no direct fetch calls

**Stores** (`src/lib/stores/`)
- Zustand stores, some with `persist` middleware (localStorage)
- `app-store.ts` — role + toast (persisted)
- `sop-meta-store.ts`, `sop-status-store.ts`, `peraturan-store.ts`, `pelaksana-store.ts`, `tim-penyusun-store.ts`, `verifikasi-batch-store.ts`, `audit-log-store.ts`
- Non-persisted stores lose all data on refresh

**Domain** (`src/lib/domain/`)
- Pure functions, no side effects (no store/window access)
- Organized by domain: `sop.ts`, `tte.ts`, `role.ts`, etc.

**Data** (`src/lib/data/` + `src/lib/seed/`)
- Seed JSON files (`sop-daftar.json`, `user.json`, etc.) — used as mock data
- `tte-storage.ts` — localStorage-backed TTE profile/signature data

**Components** (`src/components/`)
- `ui/` — shadcn/ui base components
- Feature components organized by domain: `sop/`, `tte/`, `evaluasi/`, `berita-acara/`
- `layout/` — page shells (RoleLayout, ListPageLayout, DetailPageLayout)

**Auth** (`src/lib/auth/`)
- `role-route-guard.ts` — client-side only, reads role from Zustand store
- No JWT or session token on client; role stored in localStorage

## Data Flow

### Client (current — no backend integration)
```
Route load → Hook → Zustand store / Seed JSON → Component render
User action → Hook → Zustand store update → UI reactive update
```

### Server
```
HTTP Request → ValidationPipe → Controller → Service → Repository → Prisma → DB
Response → ResponseInterceptor wraps → JSON
Error → GlobalExceptionFilter formats → JSON
```

## Key Design Decisions
- Server and client are **fully decoupled** — client does not call server yet
- Server is a **skeleton/scaffold** — Users and Posts modules exist as patterns; domain modules (SOP, TTE, etc.) not yet implemented
- Client uses localStorage + seed JSON as a demo/prototype layer
- Role-based routing is client-side only (no backend authorization)
