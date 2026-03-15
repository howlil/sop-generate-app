# STRUCTURE.md — Directory Layout and Organization

## Root Layout

```
codingan/
├── client/               # React SPA frontend
├── server/               # NestJS REST API backend
├── docs/                 # Project documentation (mostly deleted in v2)
├── .planning/            # GSD planning artifacts
│   └── codebase/         # Codebase map documents (this folder)
└── .git/
```

---

## Client (`client/`)

```
client/
├── src/
│   ├── components/           # Reusable UI and feature components
│   │   ├── berita-acara/     # Berita acara (meeting minutes) components
│   │   ├── evaluasi/         # Evaluasi (evaluation) components
│   │   ├── layout/           # App shell components
│   │   │   ├── GlobalToast.tsx
│   │   │   └── RoleLayout.tsx
│   │   ├── sop/              # SOP-domain components
│   │   │   ├── BuatSOPDialog.tsx
│   │   │   ├── RiwayatStatusPanel.tsx
│   │   │   └── SOPStatusFilterSelect.tsx
│   │   ├── tte/              # TTE (electronic signature) components
│   │   │   ├── SetupTTEDialog.tsx
│   │   │   └── TTESignatureBlock.tsx
│   │   └── ui/               # Design system primitives
│   │       ├── button.tsx
│   │       ├── search-input.tsx
│   │       ├── search-toolbar.tsx
│   │       ├── skeleton.tsx
│   │       ├── route-error.tsx
│   │       └── ...
│   │
│   ├── hooks/                # Custom React hooks (feature data + logic)
│   │   ├── useAuditLog.ts
│   │   ├── useDaftarSOPData.ts
│   │   ├── useEvaluasi.ts
│   │   ├── useEvaluasiSubmit.ts
│   │   ├── useManajemenPeraturanState.ts
│   │   ├── useManajemenTimPenyusunState.ts
│   │   ├── useSopMeta.ts
│   │   ├── useSopStatus.ts
│   │   ├── useTTESignature.ts
│   │   └── useVerifikasiBatchDetailPage.ts
│   │
│   ├── lib/                  # Non-React utilities and domain logic
│   │   ├── api/              # (Placeholder) Future HTTP client setup
│   │   ├── auth/             # Auth utilities (minimal/in progress)
│   │   ├── constants/        # App-wide constants
│   │   │   ├── roles.ts      # Role enum + type guards
│   │   │   ├── routes.ts     # Route path constants
│   │   │   └── status-badge-config.ts
│   │   ├── data/             # Static data transformers (mock layer)
│   │   │   ├── evaluasi-tahunan.ts
│   │   │   ├── peraturan.ts
│   │   │   ├── role-display.ts
│   │   │   ├── sop-daftar.ts
│   │   │   ├── sop-detail.ts
│   │   │   ├── sop-templates.ts
│   │   │   └── tte-storage.ts
│   │   ├── domain/           # Pure business logic functions
│   │   │   ├── evaluasi.ts
│   │   │   ├── evaluasi-case.ts
│   │   │   ├── sop-evaluasi.ts
│   │   │   ├── sop-status.ts
│   │   │   └── tte.ts
│   │   ├── seed/             # Static JSON seed data
│   │   │   ├── evaluasi-cases.json
│   │   │   ├── opd.json
│   │   │   ├── pelaksana.json
│   │   │   ├── penugasan-evaluasi.json
│   │   │   ├── peraturan.json
│   │   │   ├── sop-daftar.json
│   │   │   ├── sop-detail.json
│   │   │   ├── sop-templates.json
│   │   │   ├── tim-evaluasi-anggota.json
│   │   │   ├── tim-penyusun.json
│   │   │   └── user.json
│   │   ├── stores/           # Zustand state stores
│   │   │   ├── app-store.ts  # Active role state
│   │   │   ├── audit-log-store.ts
│   │   │   └── sop-meta-store.ts
│   │   └── types/            # TypeScript type definitions
│   │       ├── actor.ts
│   │       ├── audit.ts
│   │       ├── peraturan.ts
│   │       ├── sop.ts
│   │       ├── tim.ts
│   │       ├── tte.ts
│   │       └── verifikasi-batch.ts
│   │
│   ├── pages/                # Page components organized by role
│   │   ├── kepala-biro-organisasi/
│   │   │   ├── GrafikEvaluasiTahunan.tsx
│   │   │   ├── ManajemenTimEvaluasi.tsx
│   │   │   ├── ManajemenTimPenyusun.tsx
│   │   │   ├── manajemen-opd/
│   │   │   │   └── OPDTab.tsx
│   │   │   └── manajemen-tim-penyusun/
│   │   │       ├── PindahOPDTimPenyusunDialog.tsx
│   │   │       └── TimPenyusunFormDialog.tsx
│   │   ├── kepala-opd/
│   │   │   ├── BeritaAcaraPage.tsx
│   │   │   ├── DaftarSOP.tsx
│   │   │   ├── ManajemenPeraturan.tsx
│   │   │   └── manajemen-peraturan/
│   │   │       └── PeraturanTableTab.tsx
│   │   ├── tim-evaluasi/
│   │   │   ├── DaftarSOPEvaluasi.tsx
│   │   │   ├── DetailEvaluasiOPD.tsx
│   │   │   └── detail-evaluasi-opd/
│   │   │       └── DetailEvaluasiOPDSubmitDialog.tsx
│   │   ├── tim-penyusun/
│   │   │   ├── BeritaAcaraPage.tsx
│   │   │   ├── DetailSOPPenyusun.tsx
│   │   │   ├── ManajemenSOP.tsx
│   │   │   ├── PelaksanaSOP.tsx
│   │   │   └── detail-sop/
│   │   │       ├── DetailSOPMetadataPanel.tsx
│   │   │       ├── LawBasisDialog.tsx
│   │   │       └── PelaksanaDialog.tsx
│   │   ├── ttd-elektronik/
│   │   │   └── TTEBuatDialog.tsx
│   │   └── validasi/
│   │       └── ValidasiPengesahanPage.tsx
│   │
│   ├── routes/               # TanStack Router file-based routes
│   │   ├── __root.tsx        # Root shell (GlobalToast, devtools)
│   │   ├── index.tsx         # Landing page / role selector
│   │   ├── biro-organisasi.tsx      # Layout for biro-organisasi role
│   │   ├── biro-organisasi.*.tsx    # Child routes for biro-organisasi
│   │   ├── kepala-opd.tsx           # Layout for kepala-opd role
│   │   ├── kepala-opd.*.tsx         # Child routes for kepala-opd
│   │   ├── tim-evaluasi.tsx         # Layout for tim-evaluasi role
│   │   ├── tim-evaluasi.*.tsx       # Child routes for tim-evaluasi
│   │   ├── tim-penyusun.tsx         # Layout for tim-penyusun role
│   │   ├── tim-penyusun.*.tsx       # Child routes for tim-penyusun
│   │   └── validasi.*.tsx           # Validasi routes
│   │
│   ├── routeTree.gen.ts      # Auto-generated by TanStack Router (do not edit)
│   ├── router.tsx            # Router instance creation
│   ├── styles.css            # Global CSS (Tailwind imports)
│   └── vite-env.d.ts
│
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── vite.config.ts
```

---

## Server (`server/`)

```
server/
├── src/
│   ├── app.module.ts         # Root NestJS module
│   ├── app.controller.ts     # Root controller (minimal)
│   ├── app.service.ts        # Root service (minimal)
│   ├── main.ts               # Bootstrap entry point
│   │
│   ├── common/               # Shared infrastructure
│   │   ├── dto/              # Shared DTOs (pagination, etc.)
│   │   ├── filters/          # GlobalExceptionFilter
│   │   ├── interceptors/     # ResponseInterceptor
│   │   ├── logger/           # LoggerModule + LoggerService (Winston)
│   │   ├── prisma/           # PrismaModule + PrismaService
│   │   └── repositories/     # Base repository (if used)
│   │
│   ├── generated/
│   │   └── prisma/           # Prisma client (auto-generated, do not edit)
│   │
│   └── modules/              # Feature modules
│       ├── health/           # GET /health endpoint
│       ├── posts/            # Scaffold CRUD (template artifact)
│       └── users/            # Full CRUD with tests
│           ├── users.module.ts
│           ├── users.controller.ts
│           ├── users.service.ts
│           ├── users.service.spec.ts
│           └── dto/
│
├── prisma/
│   └── schema.prisma         # MySQL schema (User, Post — scaffold only)
│
├── test/
│   └── app.e2e-spec.ts       # E2E test entry
│
├── logs/                     # Winston log files (gitignored)
├── prisma.config.ts          # Prisma migrate config
├── .env.example              # Environment variable template
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

---

## Naming Conventions by Location

| Location | Convention | Example |
|----------|------------|---------|
| `routes/` | dot-separated role.feature.$param | `tim-penyusun.detail-sop.$id.tsx` |
| `pages/` | PascalCase, organized by role | `ManajemenSOP.tsx` |
| `components/ui/` | PascalCase, shadcn-style | `button.tsx`, `search-input.tsx` |
| `components/<domain>/` | PascalCase + domain prefix | `BuatSOPDialog.tsx` |
| `hooks/` | camelCase with `use` prefix | `useDaftarSOPData.ts` |
| `lib/domain/` | kebab-case | `sop-status.ts` |
| `lib/data/` | kebab-case | `sop-daftar.ts` |
| `lib/stores/` | kebab-case + `-store` suffix | `audit-log-store.ts` |
| `lib/types/` | kebab-case | `verifikasi-batch.ts` |
| `lib/seed/` | kebab-case `.json` | `sop-daftar.json` |
| `server/modules/` | kebab-case directory | `users/`, `health/` |
| `server/src/common/` | kebab-case directory | `prisma/`, `logger/` |

---

## Key File Locations

| Purpose | Path |
|---------|------|
| Role constants | `client/src/lib/constants/roles.ts` |
| Route constants | `client/src/lib/constants/routes.ts` |
| Active role store | `client/src/lib/stores/app-store.ts` |
| SOP business logic | `client/src/lib/domain/sop-status.ts` |
| TTE logic + PIN | `client/src/lib/domain/tte.ts` |
| Seed data | `client/src/lib/seed/*.json` |
| Database schema | `server/prisma/schema.prisma` |
| Server entry | `server/src/main.ts` |
| Root route shell | `client/src/routes/__root.tsx` |
| Role selector page | `client/src/routes/index.tsx` |
