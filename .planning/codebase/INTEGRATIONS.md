# External Integrations

**Analysis Date:** 2026-03-15

## APIs & External Services

**TTE (Tanda Tangan Elektronik) — BSRE:**
- The client domain layer (`client/src/lib/types/tte.ts`, `client/src/lib/data/tte-storage.ts`) models an integration with BSRE (Balai Sertifikasi Elektronik), Indonesia's national electronic signature authority.
- Current state: Integration is mocked/simulated in the client. TTE profiles, audit logs, and signature payloads are stored in `localStorage` via keys defined in `TTE_STORAGE_KEYS`.
- QR codes referencing validation URLs are generated client-side using the `qrcode` npm package (`client/src/components/tte/TTESignatureBlock.tsx`).
- No live HTTP calls to BSRE detected in current codebase.

**Mock Data API (Client Dev Mode):**
- When `VITE_USE_MOCK=true` (default), the client data layer (`client/src/lib/data/*.ts`) reads from local JSON seed files under `client/src/lib/seed/` instead of calling a real API.
- Controlled by `client/src/lib/api/config.ts`: exports `USE_MOCK` and `API_BASE_URL`.
- Setting `VITE_USE_MOCK=false` and `VITE_API_BASE_URL=<url>` switches to real API mode.

## Data Storage

**Databases:**
- MariaDB (MySQL-compatible)
  - Connection configured via env vars: `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
  - Full URL: `DATABASE_URL=mysql://root:password@localhost:3306/dbname`
  - Client: Prisma 7.x with `@prisma/adapter-mariadb` driver adapter
  - Service: `server/src/common/prisma/prisma.service.ts` — instantiates `PrismaClient` with `PrismaMariaDb` adapter, connection pool limit 10

**Schema Location:**
- `server/prisma/schema.prisma` — defines `User` and `Post` models (scaffold-level; domain models are expected to grow)
- Generated client output: `server/src/generated/prisma/` (gitignored, regenerated via `prisma generate`)

**File Storage:**
- Not detected. No S3, GCS, or local file upload integration found.

**Caching:**
- Not detected. No Redis or in-memory cache library found.

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication (no third-party auth provider)
  - Library: `@nestjs/jwt` + `passport-jwt` + `passport`
  - Password hashing: `bcrypt` (salt rounds: 10) — implemented in `server/src/modules/users/service/user.service.ts`
  - JWT config: `JWT_SECRET` and `JWT_EXPIRATION` env vars
  - Strategy type: Bearer token (`Authorization: Bearer <token>`)
  - Swagger: Bearer auth configured (`addBearerAuth()`) in `server/src/main.ts`

**Client-Side Role Management:**
- Role persisted to `localStorage` under key `biro-organisasi-role` via Zustand persist middleware
- Store: `client/src/lib/stores/app-store.ts`
- Route guard: `client/src/lib/auth/role-route-guard.ts` — uses `requireRoleBeforeLoad()` to redirect unauthorized roles to home
- Roles defined in `client/src/lib/constants/roles.ts`: `kepala-opd`, `biro-organisasi`, `tim-evaluasi`, `tim-penyusun`
- Current client auth is role-simulation only (no token validation in client); JWT validation is server-side

## Monitoring & Observability

**Error Tracking:**
- Not detected. No Sentry, Datadog, or similar integration found.

**Logs:**
- Winston with `nest-winston` integration (`server/src/common/logger/winston.config.ts`)
- Console transport: formatted with NestJS-style color + timestamp output
- File transport: `logs/error.log` (errors only, JSON format)
- File transport: `logs/combined.log` (all levels, JSON format)
- Log directory `logs/` is gitignored

**Audit Log (Client):**
- Client-side audit trail for TTE actions stored in `localStorage` under key `tte-audit-log`
- Types defined in `client/src/lib/types/audit.ts`
- Store: `client/src/lib/stores/audit-log-store.ts`

## CI/CD & Deployment

**Hosting:**
- Not configured. No Dockerfile, docker-compose, or deployment manifests detected in repository.

**CI Pipeline:**
- Not configured. No GitHub Actions, GitLab CI, or similar pipeline files detected.

## Environment Configuration

**Server required env vars (`server/.env.example`):**
- `DATABASE_HOST` — MariaDB host
- `DATABASE_USER` — MariaDB username
- `DATABASE_PASSWORD` — MariaDB password
- `DATABASE_NAME` — Database name
- `DATABASE_URL` — Full Prisma connection URL
- `PORT` — HTTP server port (default: 3000)
- `NODE_ENV` — `development` | `production`
- `JWT_SECRET` — JWT signing key
- `JWT_EXPIRATION` — Token TTL (e.g., `1d`)
- `ALLOWED_ORIGINS` — Comma-separated allowed CORS origins for production

**Client env vars (declared in `client/src/vite-env.d.ts`):**
- `VITE_USE_MOCK` — `true`/`1` enables local JSON mock mode (default: `true`)
- `VITE_API_BASE_URL` — NestJS API base URL (used when mock mode is off)

**Secrets location:**
- Server: `.env` file at `server/.env` (gitignored per `server/.gitignore`)
- Client: no secret env vars (all are public Vite vars prefixed `VITE_`)

## Webhooks & Callbacks

**Incoming:**
- None detected.

**Outgoing:**
- None detected.

## Notes on Integration Readiness

- The client is built with a mock-first approach: all data layers in `client/src/lib/data/` read from `client/src/lib/seed/*.json` files by default. Switching to real API requires setting `VITE_USE_MOCK=false` and `VITE_API_BASE_URL`.
- The server NestJS API exposes versioned REST endpoints under `/api/v1/` with Swagger documentation at `/docs`. The server is ready to be the backend for the client once the client mock flag is disabled.
- TTE/BSRE integration is modeled in types and mock data but has no live HTTP implementation yet.

---

*Integration audit: 2026-03-15*
