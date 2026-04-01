# Architecture

## Pattern
Monorepo dengan dua aplikasi independen:
- `server/` — NestJS REST API (Clean Architecture / Layered)
- `client/` — React SPA (file-based routing, client-side-only untuk saat ini)

## Single Source of Truth

**Dokumen referensi wajib:**
- `docs/ERD-DESKRIPSI.md` — Deskripsi entitas dan relasi database (20 tabel, 12+ enum)
- `docs/SCHEMA-CONSTRAINTS.md` — Constraint bisnis di luar Prisma (optimistic locking, unique constraint, invariant)
- `docs/PRD-ANALISIS-SISTEM.md` — Spesifikasi use case dan requirements fungsional/non-fungsional

**Prinsip:** Semua arsitektur, implementasi, dan dokumentasi harus selaras dengan ketiga dokumen di atas.

## Server Architecture

### Pattern: Clean Architecture (Layered)
```
Request → Controller → Service → Repository → Prisma → MariaDB
```

### Layers

**Controller** (`src/modules/{domain}/controller/`)
- Handles HTTP request, validates input via DTOs
- Delegate semua logic ke Service
- No business logic

**Service** (`src/modules/{domain}/service/`)
- Core business logic
- Enforce constraints dari `docs/SCHEMA-CONSTRAINTS.md`
- Throw NestJS HTTP exceptions (`NotFoundException`, `ConflictException`, `BadRequestException`)
- Use Repository interface (bukan concrete implementation)
- Implement constraint enforcement seperti SELECT FOR UPDATE untuk [P2-D], [P0-C]

**Repository** (`src/modules/{domain}/repository/`)
- Interface (`*.repository.interface.ts`) defines contract — typed dengan Prisma types
- Concrete class (`*.repository.ts`) implements interface via PrismaService
- Pattern: `select` projections untuk strip sensitive fields (e.g. password)
- Named @relation decorators untuk self-referential models

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
- `AppModule` → imports ConfigModule, PrismaModule, LoggerModule, AuthModule, dan domain modules (SOP, TTE, Evaluasi, dll)
- Setiap domain module self-contained (controller + service + repository + DTOs)

## Client Architecture

### Pattern: File-based routing (TanStack Router), feature-by-role
```
Route file → Hook → Store (Zustand) → API (via hooks)
```

### Key Layers

**Routes** (`src/routes/`)
- File-based routing via TanStack Router
- Route filenames encode role + page: `tim-penyusun.daftar-sop.tsx`
- Auth guard via `requireRoleBeforeLoad()` in `beforeLoad`
- Auto-generated `routeTree.gen.ts` — never edit manually

**Hooks** (`src/hooks/`)
- Thin orchestration layer per feature
- Reads/writes Zustand stores; call API endpoints (bukan seed JSON)

**Stores** (`src/lib/stores/`)
- Zustand stores, some with `persist` middleware (localStorage)
- `app-store.ts` — role + toast (persisted)
- `sop-store.ts` — SOP data (persisted untuk demo, API integration untuk production)
- `peraturan-store.ts`, `pelaksana-store.ts`, `tim-penyusun-store.ts`, `pengajuan-evaluasi-store.ts`, dll
- Non-persisted stores lose all data on refresh

**Domain** (`src/lib/domain/`)
- Pure functions, no side effects (no store/window access)
- Organized by domain: `sop.ts`, `tte.ts`, `role.ts`, `evaluasi.ts`, dll
- Implement constraint validation dari ERD

**Data** (`src/lib/data/` + `src/lib/seed/`)
- Seed JSON files untuk demo/development
- `tte-storage.ts` — localStorage-backed TTE profile/signature data (demo mode)
- API client untuk production integration

**Components** (`src/components/`)
- `ui/` — shadcn/ui base components
- Feature components organized by domain: `sop/`, `tte/`, `evaluasi/`, `berita-acara/`
- `layout/` — page shells (RoleLayout, ListPageLayout, DetailPageLayout)

**Auth** (`src/lib/auth/`)
- `role-route-guard.ts` — client-side only, reads role from Zustand store
- No JWT atau session token on client; role stored in localStorage (demo mode)
- Production: JWT token dari server, role dari token decode

## Data Flow

### Client (current — demo mode dengan seed JSON)
```
Route load → Hook → Zustand store / Seed JSON → Component render
User action → Hook → Zustand store update → UI reactive update
```

### Client (production — API integration)
```
Route load → Hook → API call → Zustand store → Component render
User action → Hook → API call → Server validation → DB update → Store refresh → UI update
```

### Server
```
HTTP Request → ValidationPipe → Controller → Service → Repository → Prisma → DB
Response → ResponseInterceptor wraps → JSON
Error → GlobalExceptionFilter formats → JSON
Constraint violations → ConflictException/BadRequestException
```

## Domain Models (dari ERD)

**Core Entities (20 tabel):**
1. **OPD** — Organisasi Perangkat Daerah (soft-delete support)
2. **Pengguna** — User dengan role (biro-organisasi, tim-penyusun, tim-evaluasi, kepala-opd)
3. **SOP** — Induk SOP (1 SOP → n DetailSOP)
4. **DetailSOP** — Versi dokumen SOP (lifecycle status: DRAFT → BERLAKU → DICABUT/DIGANTIKAN)
5. **Peraturan** — Dasar hukum (versioning, status BERLAKU/DICABUT)
6. **LangkahSOP** — Prosedur steps (type: TERMINATOR/TASK/DECISION, flowchart branching)
7. **DiagramLayout** — Layout config untuk flowchart/BPMN
8. **DiagramNodePosition** — Delta posisi manual node
9. **DiagramEdge** — Delta routing manual edge
10. **DiagramEdgePoint** — Titik-titik polyline edge
11. **Pelaksana** — Master pelaksana per OPD
12. **DetailSOPPelaksana** — Swimlane (daftar pelaksana per DetailSOP)
13. **AnggotaTimPenyusun** — Keanggotaan Tim Penyusun (AKTIF/NONAKTIF, invariant berakhirPada)
14. **AnggotaTimEvaluasi** — Keanggotaan Tim Evaluasi (global, tidak terikat OPD)
15. **PengajuanEvaluasi** — Pengajuan evaluasi (TERJADWAL/MANDIRI, optimistic locking)
16. **NilaiEvaluasi** — Hasil evaluasi (SESUAI/TIDAK_SESUAI, version field)
17. **LogNilaiEvaluasi** — Audit trail immutable perubahan nilai
18. **KredensialTTE** — Profil TTE (1:1 dengan Pengguna, PIN hash)
19. **RiwayatTandaTangan** — TTE signatures (XOR constraint: sopDetailId XOR pengajuanEvaluasiId)
20. **LogEditSOP** — Audit trail kolaborasi Tim Penyusun (bagian: METADATA/LANGKAH_SOP/dll)

**Junction Tables (M:N):**
- **DasarHukum** — DetailSOP ↔ Peraturan
- **SopTerkait** — DetailSOP ↔ DetailSOP (self-referential)
- **DetailSOPPelaksana** — DetailSOP ↔ Pelaksana (swimlane)

## Key Design Decisions

- Server dan client **fully decoupled** — client calls server via REST API
- Server **Clean Architecture** dengan constraint enforcement di Service layer
- Client uses localStorage + seed JSON sebagai demo mode; production mode calls API
- Role-based access control enforced di server (JWT guard) dan client (route guard)
- **DetailSOP** sebagai versi dokumen — mendukung historisasi sederhana
- **PengajuanEvaluasi** (bukan VerifikasiBatch) — terminologi konsisten dengan ERD
- **RiwayatTandaTangan** untuk TTE — bukan boolean flags
- **LogEditSOP** untuk audit trail — bukan LogAudit
- **Optimistic locking** pada NilaiEvaluasi — prevent lost update
- **SELECT FOR UPDATE** untuk constraint [P2-D], [P0-C] — prevent race condition

## Skills Reference

Semua development dan analysis menggunakan skill dari `.skills/` directory:

| Skill | File | Digunakan Untuk |
|-------|------|-----------------|
| Backend Developer | `.skills/backend.md` | Spec-driven NestJS development, API contract design, service layer implementation |
| Database Engineer | `.skills/database.md` | Database audit, invariant enforcement, consistency model, failure simulation |
| System Architect | `.skills/system-arch.md` | System diagram generation (BPMN, Use Case, Sequence, Class) dalam draw.io XML |
| System Analyst | `.skills/sytem-analyst.md` | PRD generation, use case analysis, business process documentation |
| Frontend to PRD | `.skills/system-fe-prd.md` | Reverse-engineer frontend code ke PRD dokumen akademis |
| Fullstack Auditor | `.skills/fullstack-audit.md` — Fullstack codebase audit, integration review |
| QA Engineer | `.skills/qa.md` | Quality assurance, testing strategy, test coverage analysis |
| DB Auditor | `.skills/db-audit.md` | Database-specific audit, schema review, query optimization |
| Frontend Reviewer | `.skills/frontend-codereview.md` | Frontend code review, React best practices |

**Usage Pattern:**
```bash
# Saat development module baru:
1. Gunakan backend.md untuk spec-driven API design
2. Gunakan database.md untuk schema audit dan invariant enforcement
3. Gunakan system-arch.md untuk generate system diagrams

# Saat analysis/audit:
1. Gunakan fullstack-audit.md untuk codebase review
2. Gunakan qa.md untuk testing strategy
3. Gunakan db-audit.md untuk database-specific audit

# Saat documentation:
1. Gunakan sytem-analyst.md untuk PRD generation
2. Gunakan system-fe-prd.md untuk reverse-engineer frontend ke PRD
```

## Constraint Enforcement Points

| Constraint | Enforcement Point | Phase |
|------------|-------------------|-------|
| [P2-D] 1 KEPALA_OPD + 1 KOORDINATOR per OPD | Service layer (SELECT FOR UPDATE) | Phase 2 |
| [P0-C] Maks 1 pengajuan aktif per OPD per jenis | Service layer (SELECT FOR UPDATE + tabel sentinel) | Phase 6 |
| [P0-B] Hanya 1 DetailSOP BERLAKU per SOP | Trigger database + Service layer | Phase 5 |
| [P0-E] Optimistic locking NilaiEvaluasi | Service layer (version check) | Phase 6 |
| [P1-A] XOR RiwayatTandaTangan | Service layer (validation) + CHECK constraint | Phase 7 |
| [P1-F] Invariant AKTIF ↔ berakhirPada NULL | Service layer (atomic update) | Phase 4 |
| [P1-B] TERJADWAL wajib nilaiOPD, MANDIRI NULL | Service layer (validation) | Phase 6 |
| [P2-F] Peraturan DICABUT tidak jadi DasarHukum | Service layer (validation) | Phase 5 |
| [P0-A] Hapus DiagramEdge/NodePosition sebelum LangkahSOP | Service layer (delete order) | Phase 5 |

---
*Last updated: 2026-04-01 — Aligned with ERD-DESKRIPSI.md dan PRD-ANALISIS-SISTEM.md v1.3*
