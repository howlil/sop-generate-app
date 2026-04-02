# Project Structure

**Project**: Sistem Informasi SOP Biro Organisasi  
**Type**: Monorepo (Client + Server)

---

## 1. Root Directory Structure

```
codingan/
├── client/                    # React + Vite frontend
├── server/                    # NestJS backend
├── diagram/                   # (Empty - for future diagrams)
├── docs/                      # Project documentation
├── .planning/                 # Planning & codebase docs
│   └── codebase/              # This directory
├── .skills/                   # Qwen Code skills
├── .qwen/                     # Qwen Code configuration
├── docker-compose.yml         # Multi-container orchestration
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
└── README.md                  # (If exists)
```

---

## 2. Client Structure (`/client`)

```
client/
├── src/
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form-field.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── search-input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── toast.tsx
│   │   ├── auth/              # Authentication components
│   │   │   └── LoginForm.tsx
│   │   ├── layout/            # Layout components
│   │   │   ├── AppLogo.tsx
│   │   │   ├── HeaderProfile.tsx
│   │   │   ├── RoleLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopNav.tsx
│   │   ├── sop/               # SOP feature components
│   │   │   ├── SopDetail.tsx
│   │   │   ├── SopForm.tsx
│   │   │   ├── SopList.tsx
│   │   │   ├── LangkahSOPForm.tsx
│   │   │   ├── DiagramEditor.tsx
│   │   │   └── SopTerkaitDialog.tsx
│   │   ├── evaluasi/          # Evaluation feature components
│   │   │   ├── EvaluasiForm.tsx
│   │   │   ├── NilaiEvaluasiForm.tsx
│   │   │   ├── PengajuanEvaluasiList.tsx
│   │   │   └── BeritaAcaraView.tsx
│   │   ├── tte/               # Digital signature components
│   │   │   ├── TTEBuatDialog.tsx
│   │   │   ├── TTEVerifyDialog.tsx
│   │   │   └── SetupTTEDialog.tsx
│   │   ├── company-profile/   # Company profile feature
│   │   ├── landing/           # Landing page components
│   │   └── berita-acara/      # Berita Acara feature
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useSOP.ts
│   │   ├── useEvaluasi.ts
│   │   └── useToast.ts
│   ├── stores/                # Zustand state stores
│   │   ├── uiStore.ts         # UI state (toasts, dialogs)
│   │   └── authStore.ts       # Auth state
│   ├── services/              # API service layer
│   │   ├── api.ts             # Axios instance configuration
│   │   ├── authService.ts
│   │   ├── sopService.ts
│   │   ├── evaluasiService.ts
│   │   └── usersService.ts
│   ├── types/                 # TypeScript type definitions
│   │   ├── sop.ts
│   │   ├── evaluasi.ts
│   │   ├── users.ts
│   │   └── api.ts
│   ├── routes/                # Route configuration (TanStack)
│   │   ├── __root.tsx         # Root route with layout
│   │   ├── index.tsx          # Landing page
│   │   ├── login.tsx          # Login page
│   │   ├── _auth.tsx          # Auth layout wrapper
│   │   ├── _public.tsx        # Public layout wrapper
│   │   └── routeTree.gen.ts   # Auto-generated route tree
│   ├── pages/                 # Page-level components
│   │   ├── Dashboard.tsx
│   │   ├── SOPManagement.tsx
│   │   ├── EvaluasiManagement.tsx
│   │   └── UserProfile.tsx
│   ├── utils/                 # Utility functions
│   │   ├── cn.ts              # className merger (clsx + twMerge)
│   │   ├── formatDate.ts
│   │   ├── formatCurrency.ts
│   │   └── validators.ts
│   ├── config/                # Configuration files
│   │   ├── api.config.ts
│   │   └── route.config.ts
│   ├── router.tsx             # Router configuration
│   ├── styles.css             # Global styles & design tokens
│   ├── routeTree.gen.ts       # Generated route tree (auto)
│   └── vite-env.d.ts          # Vite type declarations
├── public/                    # Static assets
│   ├── logo.svg
│   └── favicon.ico
├── __tests__/                 # Test files
│   └── setup.ts               # Test setup (vitest)
├── .cta.json                  # (Configuration file)
├── .dockerignore              # Docker ignore
├── .env.example               # Environment template
├── .gitignore                 # Git ignore
├── Dockerfile                 # Container build
├── package.json               # Dependencies & scripts
├── pnpm-lock.yaml             # Lock file
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite bundler config
└── vitest.config.ts           # Vitest test config
```

### Client Directory Purposes

| Directory | Purpose | Example Files |
|-----------|---------|---------------|
| `components/ui/` | Reusable UI atoms | button.tsx, input.tsx, dialog.tsx |
| `components/auth/` | Authentication UI | LoginForm.tsx |
| `components/sop/` | SOP feature UI | SopForm.tsx, LangkahSOPForm.tsx |
| `components/evaluasi/` | Evaluation UI | EvaluasiForm.tsx |
| `components/layout/` | App shell | Sidebar.tsx, RoleLayout.tsx |
| `hooks/` | Reusable React hooks | useAuth.ts, useSOP.ts |
| `stores/` | Zustand state | uiStore.ts (toasts, dialogs) |
| `services/` | API calls | sopService.ts (axios wrappers) |
| `types/` | TypeScript types | sop.ts (interfaces) |
| `routes/` | Route definitions | __root.tsx, login.tsx |
| `pages/` | Full page components | Dashboard.tsx |
| `utils/` | Helper functions | cn.ts, formatDate.ts |
| `config/` | App configuration | api.config.ts |

---

## 3. Server Structure (`/server`)

```
server/
├── src/
│   ├── common/                # Shared utilities
│   │   ├── prisma/            # Prisma service
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── logger/            # Winston logging
│   │   │   └── winston.config.ts
│   │   ├── filters/           # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/            # Auth guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/      # Response interceptors
│   │   ├── decorators/        # Custom decorators
│   │   │   ├── roles.decorator.ts
│   │   │   └── user.decorator.ts
│   │   └── dto/               # Shared DTOs
│   │       └── pagination.dto.ts
│   ├── config/                # Configuration
│   │   └── env.validation.ts  # Zod schema for env vars
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication
│   │   │   ├── auth.module.ts
│   │   │   ├── controller/
│   │   │   │   └── auth.controller.ts
│   │   │   ├── service/
│   │   │   │   └── auth.service.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── users/             # User management
│   │   │   ├── users.module.ts
│   │   │   ├── controller/
│   │   │   │   └── users.controller.ts
│   │   │   ├── service/
│   │   │   │   └── users.service.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   ├── sop/               # SOP management
│   │   │   ├── sop.module.ts
│   │   │   ├── controller/
│   │   │   │   └── sop.controller.ts
│   │   │   ├── service/
│   │   │   │   └── sop.service.ts
│   │   │   ├── repository/
│   │   │   │   └── sop.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-sop.dto.ts
│   │   │       ├── update-sop.dto.ts
│   │   │       └── langkah-sop.dto.ts
│   │   ├── evaluasi/          # Evaluation workflow
│   │   │   ├── evaluasi.module.ts
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   └── dto/
│   │   ├── opd/               # Organization management
│   │   ├── peraturan/         # Regulation management
│   │   ├── tim/               # Team management
│   │   ├── tte/               # Digital signature
│   │   └── audit/             # Audit logging
│   ├── generated/             # Prisma generated
│   │   └── prisma/            # Auto-generated types
│   │       ├── index.ts
│   │       └── prisma-client.d.ts
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry
├── prisma/                    # Prisma schema & migrations
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration files
│   │   └── YYYYMMDDHHMMSS_migration_name/
│   │       └── migration.sql
│   └── seed.ts                # Seed data script
├── test/                      # E2E tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .dockerignore              # Docker ignore
├── .env.example               # Environment template
├── .gitignore                 # Git ignore
├── .prettierrc                # Prettier config
├── Dockerfile                 # Container build
├── eslint.config.mjs          # ESLint flat config
├── nest-cli.json              # NestJS CLI config
├── package.json               # Dependencies & scripts
├── pnpm-lock.yaml             # Lock file
├── prisma.config.ts           # Prisma configuration
├── tsconfig.build.json        # Build TypeScript config
└── tsconfig.json              # Development TypeScript config
```

### Server Module Structure Convention

Each feature module follows this pattern:

```
modules/{feature}/
├── {feature}.module.ts        # Module definition with imports/exports
├── controller/
│   ├── {feature}.controller.ts    # HTTP request handlers
│   └── {feature}.controller.spec.ts
├── service/
│   ├── {feature}.service.ts       # Business logic
│   └── {feature}.service.spec.ts
├── dto/                       # Data Transfer Objects
│   ├── create-{feature}.dto.ts    # Input validation for create
│   ├── update-{feature}.dto.ts    # Input validation for update
│   └── {feature}.dto.ts           # Response type
└── repository/                # (Optional) Data access layer
    └── {feature}.repository.ts    # Prisma queries
```

---

## 4. Documentation Structure (`/docs`)

```
docs/
├── design.md                  # Design style guide (Tailwind + Radix)
├── design-style-guide.md      # Compact modern dashboard design
├── ERD-DESKRIPSI.md           # Entity Relationship Diagram description
├── PRD-ANALISIS-SISTEM.md     # Product Requirements Document
├── SCHEMA-CONSTRAINTS.md      # Database constraints & business rules
└── UX-AUDIT-REPORT.md         # UX audit findings & recommendations
```

---

## 5. File Naming Conventions

### TypeScript/React Files
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `SopForm.tsx`, `LoginForm.tsx` |
| Services | camelCase + Service suffix | `sopService.ts`, `authService.ts` |
| Hooks | camelCase with `use` prefix | `useAuth.ts`, `useSOP.ts` |
| Stores | camelCase + Store suffix | `uiStore.ts`, `authStore.ts` |
| Types | camelCase or PascalCase | `sop.ts`, `evaluasi.ts` |
| Utils | camelCase | `cn.ts`, `formatDate.ts` |
| Config | camelCase + config suffix | `api.config.ts` |
| Routes | kebab-case or camelCase | `routeTree.gen.ts`, `__root.tsx` |

### NestJS Files
| Type | Convention | Example |
|------|------------|---------|
| Modules | kebab-case + .module.ts | `auth.module.ts`, `sop.module.ts` |
| Controllers | kebab-case + .controller.ts | `auth.controller.ts` |
| Services | kebab-case + .service.ts | `auth.service.ts` |
| DTOs | kebab-case + .dto.ts | `create-user.dto.ts` |
| Guards | kebab-case + .guard.ts | `jwt-auth.guard.ts` |
| Filters | kebab-case + .filter.ts | `http-exception.filter.ts` |
| Decorators | kebab-case + .decorator.ts | `roles.decorator.ts` |

### Test Files
| Type | Convention | Example |
|------|------------|---------|
| Unit tests | `*.spec.ts` | `auth.service.spec.ts` |
| E2E tests | `*.e2e-spec.ts` | `app.e2e-spec.ts` |
| Test setup | `setup.ts` | `setup.ts` |

---

## 6. Configuration Files Overview

### Root Level
| File | Purpose |
|------|---------|
| `docker-compose.yml` | Multi-container orchestration (db, server, client) |
| `.env.example` | Environment variable template |
| `.gitignore` | Git ignore patterns |

### Client Level
| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite bundler configuration |
| `vitest.config.ts` | Vitest test runner configuration |
| `tsconfig.json` | TypeScript compiler options |
| `package.json` | Dependencies, scripts |
| `Dockerfile` | Container build instructions |

### Server Level
| File | Purpose |
|------|---------|
| `nest-cli.json` | NestJS CLI configuration |
| `tsconfig.json` | TypeScript compiler options |
| `tsconfig.build.json` | Build-specific TypeScript config |
| `eslint.config.mjs` | ESLint flat configuration |
| `.prettierrc` | Prettier formatting rules |
| `prisma.config.ts` | Prisma configuration |
| `package.json` | Dependencies, scripts, Jest config |
| `Dockerfile` | Container build instructions |

---

## 7. Build Output Structure

### Client Build (`client/dist/`)
```
dist/
├── assets/              # Bundled assets
│   ├── index-[hash].js  # Main bundle
│   ├── index-[hash].css # Styles bundle
│   └── chunks/          # Code-split chunks
└── index.html           # Entry HTML
```

### Server Build (`server/dist/`)
```
dist/
├── common/              # Compiled common utilities
├── config/              # Compiled configuration
├── modules/             # Compiled feature modules
├── app.module.js        # Root module
├── main.js              # Entry point
└── *.d.ts               # Type declarations
```

---

## 8. Generated Files

### Auto-generated (Do Not Edit)
| File | Generator | Purpose |
|------|-----------|---------|
| `client/src/routeTree.gen.ts` | TanStack Router | Route type definitions |
| `server/src/generated/prisma/` | Prisma | Database client types |
| `server/prisma/migrations/` | Prisma Migrate | SQL migration files |

### Regenerated on Changes
- **Route tree**: Regenerated on file save (TanStack Router plugin)
- **Prisma client**: Regenerated on `pnpm prisma generate`
- **Migrations**: Generated on `pnpm prisma migrate dev`

---

## 9. Import Path Aliases

### Client (`@/*`)
```typescript
// tsconfig.json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}

// Usage
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { sopService } from '@/services/sopService'
```

### Server (baseUrl: `./`)
```typescript
// tsconfig.json
{
  "baseUrl": "./"
}

// Usage
import { PrismaService } from 'common/prisma/prisma.service'
import { JwtAuthGuard } from 'common/guards/jwt-auth.guard'
import { CreateSopDto } from 'modules/sop/dto/create-sop.dto'
```

---

## 10. Volume Mounts (Docker)

### Development Volumes
```yaml
# server service
volumes:
  - ./server:/app                    # Source code (hot reload)
  - /app/node_modules                # Container node_modules (prevent override)
  - server_prisma_generated:/app/prisma/generated  # Prisma client (persistent)

# client service
volumes:
  - ./client:/app                    # Source code (hot reload)
  - /app/node_modules                # Container node_modules
  - /app/node_modules/.vite          # Vite cache
```

### Persistent Volumes
| Volume | Purpose |
|--------|---------|
| `db_data` | MySQL database files |
| `server_prisma_generated` | Prisma generated client |

---

## 11. Key Directories by Function

### Feature Implementation
When adding a new feature:

**Frontend**:
1. Add components to `client/src/components/{feature}/`
2. Add hooks to `client/src/hooks/`
3. Add services to `client/src/services/`
4. Add types to `client/src/types/`
5. Add routes to `client/src/routes/`

**Backend**:
1. Create module: `server/src/modules/{feature}/`
2. Add controller: `controller/{feature}.controller.ts`
3. Add service: `service/{feature}.service.ts`
4. Add DTOs: `dto/create-{feature}.dto.ts`, `update-{feature}.dto.ts`
5. Add module to `app.module.ts` imports

### Shared Code
**Frontend**:
- Utilities: `client/src/utils/`
- Config: `client/src/config/`
- Styles: `client/src/styles.css`

**Backend**:
- Guards: `server/src/common/guards/`
- Filters: `server/src/common/filters/`
- Interceptors: `server/src/common/interceptors/`
- Decorators: `server/src/common/decorators/`

---

## 12. Test File Organization

### Client Tests
```
client/
└── src/
    └── __tests__/
        ├── setup.ts              # Test setup (vitest)
        ├── components/
        │   └── Button.test.tsx
        ├── hooks/
        │   └── useAuth.test.ts
        └── services/
            └── sopService.test.ts
```

### Server Tests
```
server/
├── src/
│   └── modules/
│       └── auth/
│           └── service/
│               └── auth.service.spec.ts
└── test/
    ├── app.e2e-spec.ts           # E2E tests
    └── jest-e2e.json             # E2E Jest config
```

---

## 13. Environment Files

### Development
```
.env (client/)
- VITE_API_URL=http://localhost:8080/api
- VITE_WS_URL=ws://localhost:8080

.env (server/)
- NODE_ENV=development
- DATABASE_URL=mysql://root:password@localhost:3306/sop_db
- JWT_SECRET=your-secret-key
- PORT=3001
```

### Production
```
.env (client/)
- VITE_API_URL=https://api.production.com/api
- VITE_WS_URL=wss://api.production.com

.env (server/)
- NODE_ENV=production
- DATABASE_URL=mysql://user:pass@db-host:3306/sop_db
- JWT_SECRET=<strong-random-secret>
- PORT=3000
```
