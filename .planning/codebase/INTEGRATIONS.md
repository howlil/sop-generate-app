# External Integrations

**Analysis Date:** 2026-03-25

## APIs & External Services

**Internal REST API:**
- NestJS backend at `http://localhost:3000/api` (development)
- Versioned URIs: `/api/v1/...` (URI versioning, default version `1`)
- OpenAPI/Swagger docs available at `/docs`
- Client switches between mock JSON data and real API via `VITE_USE_MOCK` flag
  - Config: `client/src/lib/api/config.ts`
  - Base URL: `VITE_API_BASE_URL` env var (empty string = relative URLs)

**TTE / BSRE (Tanda Tangan Elektronik — Electronic Signature):**
- Currently simulated locally; no real BSRE HTTP calls detected
- TTE logic: `client/src/lib/domain/tte.ts` (pure PIN hash functions)
- TTE storage: `client/src/lib/data/tte-storage.ts` (localStorage-backed profiles, signatures, audit log)
- Demo mode: master PIN `12345` always accepted (`verifyPin` function)
- QR code generation for signature verification uses `qrcode` package (`client/src/components/tte/TTESignatureBlock.tsx`)
- Validation URL pattern: `{window.location.origin}/validasi/pengesahan/{signatureId}`

## Data Storage

**Databases:**
- MariaDB / MySQL
  - Provider: `mysql` in Prisma schema (`server/prisma/schema.prisma`)
  - Adapter: `@prisma/adapter-mariadb` (driver-adapter pattern, not native Prisma connector)
  - Connection: `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` env vars
  - Connection URL: `DATABASE_URL` env var (format: `mysql://user:pass@host:3306/db`)
  - Connection pool limit: 10 (`connectionLimit: 10` in `server/src/common/prisma/prisma.service.ts`)
  - ORM client: Prisma 7.x, generated to `server/src/generated/prisma/`
  - Migrations path: `server/prisma/migrations/`
  - Current schema models: `User`, `Post` (scaffold-level; production domain not yet in schema)

**File Storage:**
- Not detected — no S3, GCS, or local file upload integration found

**Caching:**
- None detected — no Redis, Memcached, or in-memory cache layer

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based auth (no third-party identity provider)
  - Packages installed: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`
  - Secret: `JWT_SECRET` env var; expiration: `JWT_EXPIRATION` env var (default `1d`)
  - Password hashing: `bcrypt` with 10 salt rounds (`server/src/modules/users/service/user.service.ts`)
  - Auth module not yet implemented as a standalone NestJS module — JWT infrastructure is installed but guards/strategies are not wired

**Role-Based Access Control (Client):**
- Client-side only role guard in `client/src/lib/auth/role-route-guard.ts`
- Role persisted to `localStorage` under key `biro-organisasi-role` via Zustand persist middleware (`client/src/lib/stores/app-store.ts`)
- Roles: `kepala-biro-organisasi`, `kepala-opd`, `tim-penyusun`, `tim-evaluasi` (from `client/src/lib/constants/roles.ts`)
- Guard redirects to `ROUTES.HOME` if role mismatch

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, Datadog, or external error tracking detected

**Logs:**
- Winston logger via `nest-winston`
  - Console transport: pretty-printed with timestamps
  - File transport: `logs/error.log` (errors only, JSON format)
  - File transport: `logs/combined.log` (all levels, JSON format)
  - Config: `server/src/common/logger/winston.config.ts`

## CI/CD & Deployment

**Hosting:**
- Not configured — no Dockerfile, docker-compose, or deployment manifests in project root

**CI Pipeline:**
- Not configured — no `.github/workflows`, GitLab CI, or similar found in project root

## Environment Configuration

**Required server env vars:**
- `DATABASE_HOST` - DB hostname
- `DATABASE_USER` - DB username
- `DATABASE_PASSWORD` - DB password
- `DATABASE_NAME` - DB schema/database name
- `DATABASE_URL` - Full connection string for Prisma migrations
- `PORT` - Server listen port (default `3000`)
- `NODE_ENV` - `development` or `production`
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRATION` - Token TTL (e.g., `1d`)
- `ALLOWED_ORIGINS` - Comma-separated CORS origins for production

**Required client env vars:**
- `VITE_USE_MOCK` - `true` (mock JSON data) or `false` (real API calls)
- `VITE_API_BASE_URL` - Backend base URL (empty = same origin)

**Secrets location:**
- Server: `server/.env` (present, not committed); template at `server/.env.example`
- Client: `client/.env` (not found); template at `client/.env.example`

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

---

*Integration audit: 2026-03-25*
