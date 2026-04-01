# Structure

## Root Layout
```
codingan/
├── client/               # React SPA (TanStack Start/Router)
├── server/               # NestJS REST API
├── docs/                 # Project documentation (SSOT)
│   ├── ERD-DESKRIPSI.md
│   ├── SCHEMA-CONSTRAINTS.md
│   ├── PRD-ANALISIS-SISTEM.md
│   └── ...
├── .skills/              # Skill guidance untuk development
│   ├── backend.md
│   ├── database.md
│   ├── system-arch.md
│   ├── sytem-analyst.md
│   ├── system-fe-prd.md
│   ├── fullstack-audit.md
│   ├── qa.md
│   ├── db-audit.md
│   └── frontend-codereview.md
├── .planning/            # EZ Agents planning artifacts
│   ├── PROJECT.md
│   ├── REQUIREMENTS.md
│   ├── ROADMAP.md
│   ├── STATE.md
│   └── codebase/         # This codebase map
└── .agents/              # Agent skills
```

## Single Source of Truth

**Dokumen referensi wajib:**
- `docs/ERD-DESKRIPSI.md` — Deskripsi entitas dan relasi database
- `docs/SCHEMA-CONSTRAINTS.md` — Constraint bisnis di luar Prisma
- `docs/PRD-ANALISIS-SISTEM.md` — Spesifikasi use case dan requirements
- `.skills/` directory — Skill guidance untuk development dan analysis

## Skills Directory Structure

```
.skills/
├── backend.md            # Spec-driven NestJS development
├── database.md           # Database audit, invariants, consistency
├── system-arch.md        # System diagrams (BPMN, Use Case, Sequence, Class)
├── sytem-analyst.md      # PRD generation, use case analysis
├── system-fe-prd.md      # Frontend to PRD reverse engineering
├── fullstack-audit.md    # Fullstack codebase audit
├── qa.md                 # Quality assurance, testing strategy
├── db-audit.md           # Database-specific audit
└── frontend-codereview.md # Frontend code review
```

**Usage Rule:** Setiap task development atau analysis harus merujuk ke skill yang sesuai di `.skills/`.

---

## Server Structure
```
server/
├── src/
│   ├── main.ts                          # Bootstrap (entry point)
│   ├── app.module.ts                    # Root module
│   ├── app.controller.ts                # Root health controller
│   ├── app.service.ts                   # Root service
│   ├── common/
│   │   ├── dto/
│   │   │   ├── api-response.dto.ts      # ApiResponseDto wrapper
│   │   │   └── pagination.dto.ts        # PaginatedResponseDto
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts # GlobalExceptionFilter
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts  # ResponseInterceptor
│   │   ├── logger/
│   │   │   ├── logger.module.ts
│   │   │   └── winston.config.ts        # Winston transports config
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts         # Global PrismaModule
│   │   │   └── prisma.service.ts        # PrismaClient wrapper
│   │   └── repositories/
│   │       └── base.repository.ts       # IBaseRepository<T,C,U> interface
│   ├── generated/prisma/                # Auto-generated Prisma client
│   └── modules/
│       ├── auth/                        # Auth module (JWT, login, register)
│       │   ├── controller/
│       │   │   ├── auth.controller.ts
│       │   │   └── auth.controller.spec.ts
│       │   ├── service/
│       │   │   ├── auth.service.ts
│       │   │   └── auth.service.spec.ts
│       │   ├── dto/
│       │   │   ├── login.dto.ts
│       │   │   └── register.dto.ts
│       │   ├── guards/
│       │   │   ├── jwt-auth.guard.ts
│       │   │   └── roles.guard.ts
│       │   ├── strategies/
│       │   │   └── jwt.strategy.ts
│       │   └── auth.module.ts
│       ├── opd/                         # OPD module
│       │   ├── controller/opd.controller.ts
│       │   ├── service/opd.service.ts
│       │   ├── repository/
│       │   │   ├── opd.repository.interface.ts
│       │   │   └── opd.repository.ts
│       │   ├── dto/
│       │   │   ├── create-opd.dto.ts
│       │   │   └── update-opd.dto.ts
│       │   └── opd.module.ts
│       ├── peraturan/                   # Peraturan module
│       │   ├── controller/peraturan.controller.ts
│       │   ├── service/peraturan.service.ts
│       │   ├── repository/peraturan.repository.ts
│       │   ├── dto/create-peraturan.dto.ts
│       │   └── peraturan.module.ts
│       ├── sop/                         # SOP module (Core)
│       │   ├── controller/sop.controller.ts
│       │   ├── service/
│       │   │   ├── sop.service.ts
│       │   │   └── detail-sop.service.ts
│       │   ├── repository/
│       │   │   ├── sop.repository.ts
│       │   │   └── detail-sop.repository.ts
│       │   ├── dto/
│       │   │   ├── create-sop.dto.ts
│       │   │   ├── create-detail-sop.dto.ts
│       │   │   └── update-detail-sop.dto.ts
│       │   └── sop.module.ts
│       ├── langkah-sop/                 # Prosedur module
│       │   ├── controller/langkah-sop.controller.ts
│       │   ├── service/langkah-sop.service.ts
│       │   ├── repository/langkah-sop.repository.ts
│       │   ├── dto/
│       │   │   ├── create-langkah-sop.dto.ts
│       │   │   └── update-langkah-sop.dto.ts
│       │   └── langkah-sop.module.ts
│       ├── diagram/                     # Diagram module (Layout, Node, Edge)
│       │   ├── controller/diagram.controller.ts
│       │   ├── service/
│       │   │   ├── diagram-layout.service.ts
│       │   │   ├── diagram-node.service.ts
│       │   │   └── diagram-edge.service.ts
│       │   ├── repository/
│       │   │   ├── diagram-layout.repository.ts
│       │   │   ├── diagram-node.repository.ts
│       │   │   └── diagram-edge.repository.ts
│       │   ├── dto/
│       │   │   ├── create-diagram-layout.dto.ts
│       │   │   ├── create-diagram-node.dto.ts
│       │   │   └── create-diagram-edge.dto.ts
│       │   └── diagram.module.ts
│       ├── pelaksana/                   # Pelaksana module
│       │   ├── controller/pelaksana.controller.ts
│       │   ├── service/pelaksana.service.ts
│       │   ├── repository/pelaksana.repository.ts
│       │   ├── dto/create-pelaksana.dto.ts
│       │   └── pelaksana.module.ts
│       ├── tim/                         # Tim module (Penyusun + Evaluasi)
│       │   ├── controller/tim.controller.ts
│       │   ├── service/
│       │   │   ├── tim-penyusun.service.ts
│       │   │   └── tim-evaluasi.service.ts
│       │   ├── repository/
│       │   │   ├── tim-penyusun.repository.ts
│       │   │   └── tim-evaluasi.repository.ts
│       │   ├── dto/
│       │   │   ├── create-anggota-tim-penyusun.dto.ts
│       │   │   └── create-anggota-tim-evaluasi.dto.ts
│       │   └── tim.module.ts
│       ├── evaluasi/                    # Evaluasi module (PengajuanEvaluasi, NilaiEvaluasi)
│       │   ├── controller/evaluasi.controller.ts
│       │   ├── service/
│       │   │   ├── pengajuan-evaluasi.service.ts
│       │   │   └── nilai-evaluasi.service.ts
│       │   ├── repository/
│       │   │   ├── pengajuan-evaluasi.repository.ts
│       │   │   └── nilai-evaluasi.repository.ts
│       │   ├── dto/
│       │   │   ├── create-pengajuan-evaluasi.dto.ts
│       │   │   └── create-nilai-evaluasi.dto.ts
│       │   └── evaluasi.module.ts
│       ├── tte/                         # TTE module (KredensialTTE, RiwayatTandaTangan)
│       │   ├── controller/tte.controller.ts
│       │   ├── service/
│       │   │   ├── kredensial-tte.service.ts
│       │   │   └── riwayat-tanda-tangan.service.ts
│       │   ├── repository/
│       │   │   ├── kredensial-tte.repository.ts
│       │   │   └── riwayat-tanda-tangan.repository.ts
│       │   ├── dto/
│       │   │   ├── create-kredensial-tte.dto.ts
│       │   │   └── tte-sign.dto.ts
│       │   └── tte.module.ts
│       └── audit/                       # Audit module (LogEditSOP, LogNilaiEvaluasi)
│           ├── controller/audit.controller.ts
│           ├── service/audit-log.service.ts
│           ├── repository/audit-log.repository.ts
│           └── audit.module.ts
├── prisma/
│   ├── schema.prisma                    # Database schema (20 models, 12+ enums)
│   ├── seed.ts                          # Seed script (FakerJS)
│   └── migrations/                      # Migration files
├── test/
│   └── app.e2e-spec.ts
├── prisma.config.ts
├── nest-cli.json
├── tsconfig.json
├── .env.example
└── package.json
```

## Client Structure
```
client/
├── src/
│   ├── components/
│   │   ├── ui/                          # shadcn/ui base components (30+ files)
│   │   ├── layout/                      # Page shells
│   │   │   ├── RoleLayout.tsx           # Sidebar + role nav wrapper
│   │   │   ├── ListPageLayout.tsx       # Standard list page chrome
│   │   │   ├── DetailPageLayout.tsx     # Detail page dengan back button
│   │   │   └── ...
│   │   ├── sop/                         # SOP-related components
│   │   │   ├── diagram/                 # BPMN + flowchart diagram rendering
│   │   │   │   ├── logic/              # Routing algorithms (bpmnRouter, orthogonalRouter)
│   │   │   │   └── shapes/             # Shape components
│   │   │   ├── sop-card.tsx
│   │   │   ├── sop-metadata-form.tsx
│   │   │   ├── sop-status-badge.tsx
│   │   │   └── ...
│   │   ├── tte/                         # TTE (digital signature) components
│   │   │   ├── tte-profile-form.tsx
│   │   │   ├── tte-pin-dialog.tsx
│   │   │   ├── tte-signature-block.tsx
│   │   │   └── ...
│   │   ├── evaluasi/                    # Evaluation components
│   │   │   ├── evaluasi-form.tsx
│   │   │   ├── evaluasi-list.tsx
│   │   │   └── ...
│   │   ├── berita-acara/               # Berita Acara document component
│   │   │   ├── berita-acara-document.tsx
│   │   │   └── berita-acara-preview.tsx
│   │   └── opd/                        # OPD components
│   │       ├── opd-list.tsx
│   │       └── opd-form.tsx
│   ├── hooks/                           # Feature hooks (one per concern)
│   │   ├── use-auth.ts
│   │   ├── use-sop.ts
│   │   ├── use-detail-sop.ts
│   │   ├── use-peraturan.ts
│   │   ├── use-pelaksana.ts
│   │   ├── use-tim-penyusun.ts
│   │   ├── use-tim-evaluasi.ts
│   │   ├── use-pengajuan-evaluasi.ts
│   │   ├── use-nilai-evaluasi.ts
│   │   ├── use-tte.ts
│   │   └── ...
│   ├── lib/
│   │   ├── api/                         # API client (config.ts + per-domain files)
│   │   │   ├── config.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── sop.api.ts
│   │   │   ├── peraturan.api.ts
│   │   │   ├── evaluasi.api.ts
│   │   │   └── ...
│   │   ├── auth/
│   │   │   └── role-route-guard.ts      # Client-side role guard
│   │   ├── constants/
│   │   │   ├── roles.ts                 # ROLES const + RoleKey type
│   │   │   ├── routes.ts                # ROUTES path constants
│   │   │   ├── evaluasi.ts              # Evaluasi constants
│   │   │   ├── status-badge-config.ts   # Status badge display config
│   │   │   ├── status-sop.ts            # StatusSOP enum display
│   │   │   └── ui.ts                    # UI constants
│   │   ├── domain/                      # Pure business logic functions
│   │   │   ├── sop.ts                   # SOP domain logic
│   │   │   ├── detail-sop.ts            # DetailSOP domain logic
│   │   │   ├── tte.ts                   # TTE domain logic
│   │   │   ├── role.ts                  # Role-based logic
│   │   │   ├── opd.ts                   # OPD domain logic
│   │   │   ├── evaluasi.ts              # Evaluasi domain logic
│   │   │   └── ...
│   │   ├── stores/                      # Zustand stores
│   │   │   ├── app-store.ts             # Role + toast (persisted)
│   │   │   ├── auth-store.ts            # JWT token + user info (persisted)
│   │   │   ├── sop-store.ts             # SOP data (persisted for demo)
│   │   │   ├── detail-sop-store.ts
│   │   │   ├── peraturan-store.ts
│   │   │   ├── pelaksana-store.ts
│   │   │   ├── tim-penyusun-store.ts
│   │   │   ├── tim-evaluasi-store.ts
│   │   │   ├── pengajuan-evaluasi-store.ts
│   │   │   ├── nilai-evaluasi-store.ts
│   │   │   └── tte-store.ts
│   │   ├── types/                       # TypeScript interfaces/types
│   │   │   ├── sop.types.ts
│   │   │   ├── detail-sop.types.ts
│   │   │   ├── evaluasi.types.ts
│   │   │   ├── tte.types.ts
│   │   │   └── ...
│   │   ├── seed/                        # Static seed JSON files (mock data)
│   │   │   ├── sop-daftar.json
│   │   │   ├── sop-detail.json
│   │   │   ├── user.json
│   │   │   └── ...
│   │   └── utils/                       # Utility functions (cn, formatDate, etc.)
│   ├── routes/                          # TanStack Router file-based routes
│   │   ├── __root.tsx                   # Root layout
│   │   ├── index.tsx                    # Home / role picker
│   │   ├── tim-penyusun.tsx             # Role layout wrapper
│   │   ├── tim-penyusun.daftar-sop.tsx  # Route: /tim-penyusun/daftar-sop
│   │   ├── tim-penyusun.detail-sop.tsx
│   │   ├── tim-penyusun.ttd-elektronik.tsx
│   │   ├── kepala-opd.tsx
│   │   ├── kepala-opd.pantau-sop.tsx
│   │   ├── kepala-opd.detail-sop.tsx
│   │   ├── kepala-opd.ttd-elektronik.tsx
│   │   ├── tim-evaluasi.tsx
│   │   ├── tim-evaluasi.evaluasi-sop.tsx
│   │   ├── biro-organisasi.tsx
│   │   ├── biro-organisasi.manajemen-opd.tsx
│   │   ├── biro-organisasi.manajemen-tim-penyusun.tsx
│   │   ├── biro-organisasi.manajemen-tim-evaluasi.tsx
│   │   ├── biro-organisasi.manajemen-peraturan.tsx
│   │   ├── biro-organisasi.terjadwal-evaluasi.tsx
│   │   ├── biro-organisasi.ttd-elektronik.tsx
│   │   └── ...
│   ├── routeTree.gen.ts                 # Auto-generated — never edit manually
│   ├── router.tsx                       # Router instance factory
│   ├── styles.css                       # Global CSS + Tailwind base
│   └── utils/                           # Utility functions (cn, formatDate, etc.)
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Key Naming Conventions

### Server
- Module files: `{domain}.module.ts`
- Controllers: `{domain}.controller.ts`
- Services: `{domain}.service.ts`
- Repositories: `{domain}.repository.ts` + `{domain}.repository.interface.ts`
- DTOs: `create-{domain}.dto.ts`, `update-{domain}.dto.ts`
- Tests: `*.spec.ts` (co-located next to source file)
- Guards: `{name}.guard.ts`
- Strategies: `{name}.strategy.ts`
- Filters: `{name}.filter.ts`
- Interceptors: `{name}.interceptor.ts`

### Client
- Routes: `{role}.{page}.tsx` — dot-separated maps to URL path segments
- Hooks: `use{Feature}.ts` (camelCase)
- Stores: `{domain}-store.ts`
- Components: PascalCase `ComponentName.tsx`
- Types: `{domain}.types.ts` in `lib/types/`
- Constants: kebab-case files, SCREAMING_SNAKE_CASE exports
- API: `{domain}.api.ts` in `lib/api/`
- Domain logic: `{domain}.ts` in `lib/domain/` (pure functions, no side effects)

## Domain Modules Mapping

| Module | ERD Entities | PRD Use Cases |
|--------|--------------|---------------|
| Auth | Pengguna, KredensialTTE | UC-13 (Setup TTE) |
| OPD | OPD | UC-08 |
| Peraturan | Peraturan | UC-12 |
| SOP | SOP, DetailSOP | UC-01, UC-02 |
| LangkahSOP | LangkahSOP | UC-03 |
| Diagram | DiagramLayout, DiagramNodePosition, DiagramEdge, DiagramEdgePoint | UC-03 |
| Pelaksana | Pelaksana, DetailSOPPelaksana | UC-03 |
| Tim | AnggotaTimPenyusun, AnggotaTimEvaluasi | UC-09, UC-11 |
| Evaluasi | PengajuanEvaluasi, NilaiEvaluasi, LogNilaiEvaluasi | UC-04, UC-05, UC-10 |
| TTE | KredensialTTE, RiwayatTandaTangan | UC-06, UC-07, UC-13 |
| Audit | LogEditSOP | Semua UC |

---
*Last updated: 2026-04-01 — Aligned with ERD-DESKRIPSI.md dan PRD-ANALISIS-SISTEM.md v1.3*
