# Structure

## Root Layout
```
codingan/
├── client/               # React SPA (TanStack Start/Router)
├── server/               # NestJS REST API
├── docs/                 # Project documentation
├── .planning/            # EZ Agents planning artifacts
│   └── codebase/         # This codebase map
└── .agents/              # Agent skills
```

## Server Structure
```
server/
├── src/
│   ├── main.ts                          # Bootstrap (entry point)
│   ├── app.module.ts                    # Root module
│   ├── app.controller.ts                # Root health-ish controller
│   ├── app.service.ts                   # Root service
│   ├── app.controller.spec.ts           # Root controller test
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
│       ├── health/                      # Health check module
│       │   ├── controller/health.controller.ts
│       │   ├── service/health.service.ts
│       │   └── health.module.ts
│       ├── posts/                       # Example Posts module (scaffold pattern)
│       │   ├── controller/post.controller.ts
│       │   ├── service/post.service.ts
│       │   ├── repository/
│       │   │   ├── post.repository.interface.ts
│       │   │   └── post.repository.ts
│       │   ├── dto/
│       │   │   ├── create-post.dto.ts
│       │   │   └── update-post.dto.ts
│       │   └── posts.module.ts
│       └── users/                       # Users module (pattern reference)
│           ├── controller/
│           │   ├── user.controller.ts
│           │   └── user.controller.spec.ts
│           ├── service/
│           │   ├── user.service.ts
│           │   └── user.service.spec.ts
│           ├── repository/
│           │   ├── user.repository.interface.ts
│           │   └── user.repository.ts
│           ├── dto/
│           │   ├── create-user.dto.ts
│           │   └── update-user.dto.ts
│           └── users.module.ts
├── prisma/
│   └── schema.prisma                    # Database schema
├── prisma.config.ts
├── test/
│   └── app.e2e-spec.ts
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
│   │   │   ├── DetailPageLayout.tsx     # Detail page with back button
│   │   │   └── ...
│   │   ├── sop/                         # SOP-related components
│   │   │   ├── diagram/                 # BPMN + flowchart diagram rendering
│   │   │   │   ├── logic/              # Routing algorithms (bpmnRouter, orthogonalRouter)
│   │   │   │   └── shapes/             # Shape components
│   │   │   └── ...
│   │   ├── tte/                         # TTE (digital signature) components
│   │   ├── evaluasi/                    # Evaluation components
│   │   └── berita-acara/               # Berita Acara document component
│   ├── hooks/                           # Feature hooks (one per concern)
│   ├── lib/
│   │   ├── api/                         # API client (config.ts + per-domain files)
│   │   ├── auth/
│   │   │   └── role-route-guard.ts      # Client-side role guard
│   │   ├── constants/
│   │   │   ├── roles.ts                 # ROLES const + RoleKey type
│   │   │   ├── routes.ts                # ROUTES path constants
│   │   │   ├── evaluasi.ts              # Evaluasi constants
│   │   │   ├── status-badge-config.ts   # Status badge display config
│   │   │   └── ui.ts                   # UI constants
│   │   ├── data/                        # Data access (localStorage adapters)
│   │   ├── domain/                      # Pure business logic functions
│   │   │   ├── sop.ts, tte.ts, role.ts, opd.ts, ...
│   │   ├── seed/                        # Static seed JSON files (mock data)
│   │   │   ├── sop-daftar.json
│   │   │   ├── sop-detail.json
│   │   │   ├── user.json
│   │   │   └── ...
│   │   ├── stores/                      # Zustand stores
│   │   │   ├── app-store.ts             # Role + toast (persisted)
│   │   │   ├── sop-meta-store.ts
│   │   │   ├── sop-status-store.ts
│   │   │   ├── peraturan-store.ts
│   │   │   ├── pelaksana-store.ts
│   │   │   ├── tim-penyusun-store.ts
│   │   │   ├── verifikasi-batch-store.ts
│   │   │   └── audit-log-store.ts
│   │   └── types/                       # TypeScript interfaces/types
│   ├── routes/                          # TanStack Router file-based routes
│   │   ├── __root.tsx                   # Root layout
│   │   ├── index.tsx                    # Home / role picker
│   │   ├── tim-penyusun.tsx             # Role layout wrapper
│   │   ├── tim-penyusun.daftar-sop.tsx  # Route: /tim-penyusun/daftar-sop
│   │   ├── kepala-opd.tsx
│   │   ├── kepala-biro-organisasi.tsx
│   │   ├── tim-evaluasi.tsx
│   │   └── ...
│   ├── routeTree.gen.ts                 # Auto-generated — never edit
│   ├── router.tsx                       # Router instance factory
│   ├── styles.css                       # Global CSS + Tailwind base
│   └── utils/                           # Utility functions (cn, formatDate, etc.)
├── vite.config.ts
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

### Client
- Routes: `{role}.{page}.tsx` — dot-separated maps to URL path segments
- Hooks: `use{Feature}.ts` (camelCase)
- Stores: `{domain}-store.ts`
- Components: PascalCase `ComponentName.tsx`
- Types: `{domain}.ts` in `lib/types/`
- Constants: kebab-case files, SCREAMING_SNAKE_CASE exports
