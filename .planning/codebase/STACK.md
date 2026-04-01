# Technology Stack

**Analysis Date:** 2026-04-01
**Aligned with:** ERD-DESKRIPSI.md, PRD-ANALISIS-SISTEM.md v1.3

## Single Source of Truth

**Dokumen referensi wajib:**
- `docs/ERD-DESKRIPSI.md` — Deskripsi entitas dan relasi database
- `docs/SCHEMA-CONSTRAINTS.md` — Constraint bisnis di luar Prisma
- `docs/PRD-ANALISIS-SISTEM.md` — Spesifikasi use case dan requirements
- `.skills/backend.md` — Spec-driven NestJS development guidance
- `.skills/database.md` — Database audit dan consistency guidance

---

## Languages

**Primary:**
- TypeScript 5.7.x - Both client (`client/tsconfig.json`) dan server (`server/tsconfig.json`)

**Secondary:**
- TSX (React JSX) - Semua client UI components di `client/src/`
- Prisma Schema Language - Database schema definition

## Runtime

**Environment:**
- Node.js (no `.nvmrc` pinned; package engines not set)

**Package Manager:**
- pnpm - Used in both workspaces
- Lockfiles: `client/pnpm-lock.yaml` dan `server/pnpm-lock.yaml` (both present)

## Frameworks

**Server (backend):**
- NestJS 11.x (`@nestjs/core ^11.0.1`) - REST API framework
  - `@nestjs/common`, `@nestjs/platform-express` - Core NestJS building blocks
  - `@nestjs/config ^4.0.3` - `.env` configuration loading
  - `@nestjs/swagger ^11.2.6` - OpenAPI/Swagger docs at `/docs`
  - `@nestjs/jwt ^11.0.2` + `@nestjs/passport ^11.0.5` + `passport-jwt ^4.0.1` - JWT auth
  - `@nestjs/throttler` - Rate limiting (optional, untuk production)
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
- `prisma ^7.5.0` + `@prisma/client ^7.5.0` - ORM untuk database access
- `@prisma/adapter-mariadb ^7.5.0` - MariaDB/MySQL driver adapter untuk Prisma
- `bcrypt ^6.0.0` - Password hashing (10 rounds salt)
- `class-validator ^0.15.1` + `class-transformer ^0.5.1` - DTO validation via decorators
- `nest-winston ^1.10.2` + `winston ^3.19.0` - Structured logging (console + file)
- `rxjs ^7.8.1` - NestJS reactive primitives
- `uuid` - UUID generation untuk primary keys

**Critical (client):**
- `zustand ^5.0.11` - Lightweight global state management (dengan `persist` middleware ke `localStorage`)
- `@radix-ui/*` - Unstyled accessible UI primitives (accordion, dialog, dropdown-menu, label, slot, switch, alert-dialog)
- `framer-motion ^12.36.0` - Animation library
- `lucide-react ^0.561.0` - Icon set
- `qrcode ^1.5.4` - QR code generation (used in TTE signature blocks)
- `class-variance-authority ^0.7.1` + `clsx ^2.1.1` + `tailwind-merge ^2.6.0` - CVA/cn utility pattern
- `@tanstack/react-query` - Data fetching dan caching (untuk API integration)

## Configuration

**Environment (server):**
- Loaded from `.env` via `@nestjs/config` (`ConfigModule.forRoot`)
- `.env.example` present at `server/.env.example`
- Required vars:
  ```
  DATABASE_HOST=localhost
  DATABASE_USER=root
  DATABASE_PASSWORD=secret
  DATABASE_NAME=sop_biro_organisasi
  DATABASE_URL=mysql://root:secret@localhost:3306/sop_biro_organisasi
  PORT=3000
  NODE_ENV=development
  JWT_SECRET=your-secret-key-change-in-production
  JWT_EXPIRATION=1h
  ALLOWED_ORIGINS=http://localhost:3000
  ```

**Environment (client):**
- Vite env vars prefixed dengan `VITE_`
- `.env.example` present at `client/.env.example`
- `VITE_USE_MOCK` - switches data layer antara mock JSON dan real API (`true` by default untuk demo)
- `VITE_API_BASE_URL` - backend base URL (empty string default, production: `https://api.example.com`)

**TypeScript (server):**
- Target `ES2020`, `module: commonjs`, decorators enabled (`emitDecoratorMetadata`, `experimentalDecorators`)
- `strictNullChecks: true`, `noImplicitAny: false`
- Path aliases: `@/*` → `./src/*`

**TypeScript (client):**
- Target `ES2022`, `module: ESNext`, `jsx: react-jsx`
- Strict mode enabled; path alias `@/*` → `./src/*`

**Build:**
- Server: `server/nest-cli.json` defines `sourceRoot: src` dan `deleteOutDir: true`; outputs to `dist/`
- Server: `server/prisma.config.ts` - Prisma config pointing to `prisma/schema.prisma`
- Client: `client/vite.config.ts` - plugins: TanStack Start, TanStack DevTools, React, TailwindCSS, vite-tsconfig-paths

## Database

**Database:** MariaDB 10.x (kompatibel dengan MySQL 8.x)
**ORM:** Prisma 7.x
**Adapter:** `@prisma/adapter-mariadb`

**Schema:**
- 20 tabel domain (OPD, Pengguna, SOP, DetailSOP, Peraturan, LangkahSOP, DiagramLayout, DiagramNodePosition, DiagramEdge, DiagramEdgePoint, Pelaksana, DetailSOPPelaksana, AnggotaTimPenyusun, AnggotaTimEvaluasi, PengajuanEvaluasi, NilaiEvaluasi, LogNilaiEvaluasi, KredensialTTE, RiwayatTandaTangan, LogEditSOP)
- 12+ enum (StatusSOP, StatusPeraturan, StatusKeanggotaan, HasilEvaluasi, JenisPengajuanEvaluasi, StatusPengajuanEvaluasi, PeranTTE, BagianSOP, GayaPanah, StatusKomentar, JenisLangkah, StatusDiagram)
- Composite primary keys untuk junction tables (DasarHukum, SopTerkait, DetailSOPPelaksana)
- FK indexes untuk performa query
- Delete behavior: Cascade/Restrict/SetNull sesuai ERD

**Migration:**
- `prisma migrate dev` untuk development
- `prisma migrate deploy` untuk production
- `prisma db seed` untuk seed data (FakerJS)

## Platform Requirements

**Development:**
- Node.js + pnpm required
- MariaDB/MySQL database instance (host/user/password/db configurable via `.env`)
- Server dev command: `nest start --watch` (port 3000 default)
- Client dev command: `vite dev --port 3000`
- Prisma Studio: `prisma studio` (port 5555 default)

**Production:**
- Server: `node dist/main` (compiled NestJS)
- Client: `vite build` + `vite preview` atau static host (Netlify, Vercel, S3+CloudFront)
- Database: MariaDB production instance (managed atau self-hosted)
- Reverse proxy: Nginx atau Traefik untuk SSL termination
- Process manager: PM2 atau systemd untuk server

**CI/CD (optional, v2.0):**
- GitHub Actions atau GitLab CI
- Automated testing (Jest + Vitest)
- Automated migration (`prisma migrate deploy`)
- Docker containerization

---
*Stack analysis: 2026-04-01 — Aligned with ERD-DESKRIPSI.md dan PRD-ANALISIS-SISTEM.md v1.3*
