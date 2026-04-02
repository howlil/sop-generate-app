# Client Folder Structure Analysis & Clean Code Recommendations

## Executive Summary

**Current State:** Medium-sized React application (~224 source files) with TanStack Router, TanStack Query, and Zustand. The architecture follows feature-based organization but has some inconsistencies.

**Overall Assessment:** ✅ **Good foundation** - Clear separation of concerns with routes/pages/features/components layers. Minor refactoring needed for long-term maintainability.

---

## 1. Current Architecture Overview

### 1.1 Tech Stack
| Category | Technology |
|----------|-----------|
| Framework | React 19.2 |
| Routing | TanStack Router v1.132 (file-based) |
| Data Fetching | TanStack Query v5.96 |
| Client State | Zustand v5 |
| Styling | Tailwind CSS v4 + Radix UI |
| Build Tool | Vite v7 |
| Language | TypeScript (strict mode) |

### 1.2 Current Folder Structure

```
client/src/
├── routes/              # TanStack Router definitions (36 files)
│   ├── __root.tsx       # Root with auth guard
│   ├── index.tsx        # Redirect by role
│   ├── auth/
│   │   └── login.tsx
│   ├── [role].tsx       # Role layouts (4 files)
│   └── [role].[page].tsx # Leaf routes (30+ files)
│
├── pages/               # Page-level components (25 files)
│   ├── tim-penyusun/    # 6 files + 1 subdir
│   ├── tim-evaluasi/    # 5 files
│   ├── kepala-opd/      # 4 files
│   ├── kepala-biro-organisasi/ # 8 files
│   ├── ttd-elektronik/  # 1 file
│   ├── LoginPage.tsx
│   └── CompanyProfile.tsx
│
├── features/            # Domain modules (7 features)
│   ├── auth/            # ✅ Complete (types, services, hooks, components)
│   ├── sop/             # ✅ Complete
│   ├── evaluasi/        # ✅ Complete
│   ├── tim/             # ✅ Complete
│   ├── tte/             # ✅ Complete
│   ├── audit/           # ⚠️ No components
│   └── organisasi/      # ⚠️ No components, no types
│
├── components/          # Shared UI (50+ files)
│   ├── ui/              # 38 primitives (button, dialog, table)
│   ├── layout/          # 10 layouts (RoleLayout, PageHeader)
│   ├── sop/             # Shared SOP components
│   ├── berita-acara/    # Domain-specific
│   ├── company-profile/ # Domain-specific
│   └── landing/         # Marketing pages
│
├── stores/              # Zustand stores
│   ├── authStore.ts     # User state + persistence
│   └── uiStore.ts       # Toast, sidebar state
│
├── config/              # App configuration
│   ├── api.config.ts    # Base URL, headers
│   ├── query-client.ts  # QueryClient instance
│   ├── query.config.ts  # TanStack Query defaults
│   └── sidebar.config.ts # Role-based sidebar
│
├── utils/               # Utilities (15+ files)
│   ├── api-client.ts    # Fetch wrapper
│   ├── query-keys.ts    # Query key factory
│   ├── role.ts          # Role guards
│   ├── constants.ts     # App constants
│   ├── handleApi.ts     # Error handling
│   ├── cn.ts            # Class merger
│   └── ...              # format-date, pagination, filters
│
├── types/               # Shared types
│   └── common.ts        # Cross-feature types
│
└── services/            # ⚠️ EMPTY (moved to features/)
```

**File Count:** ~224 files in `client/src/`

---

## 2. Architectural Patterns

### 2.1 Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ ROUTES (routes/*.tsx)                                       │
│ • File-based routing (TanStack Router)                      │
│ • Route guards (role-based access control)                  │
│ • Import pages/components, NO business logic                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PAGES (pages/**/*.tsx)                                      │
│ • Page-level composition                                    │
│ • Wire feature hooks together                               │
│ • Handle page-specific state                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FEATURES (features/*/index.ts)                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ types/    → Domain types & DTOs                     │    │
│ │ services/ → API calls (apiClient)                   │    │
│ │ hooks/    → TanStack Query + business logic         │    │
│ │ components/ → Feature-specific UI                   │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ COMPONENTS (components/**/)                                 │
│ • ui/         → Primitive components (button, dialog)       │
│ • layout/     → Layout wrappers (RoleLayout, PageHeader)    │
│ • shared/     → Cross-feature components                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STORES (stores/*.ts)                                        │
│ • authStore (Zustand) - User state, auth persistence        │
│ • uiStore (Zustand)   - Toast, sidebar state                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Example: SOP List

```
USER ACTION
  ↓
Page Component (pages/tim-penyusun/ManajemenSOP.tsx)
  ↓ useDaftarSOPData(filters)
Feature Hook (features/sop/hooks/useDaftarSOPData.ts)
  ↓ useSop()
Query Hook (features/sop/hooks/useSop.ts)
  ↓ sopApi.findAll(params)
API Service (features/sop/services/sop.api.ts)
  ↓ apiClient.get()
API Client (utils/api-client.ts)
  ↓ fetch()
Backend API
```

### 2.3 Route Guard Pattern

```typescript
// routes/__root.tsx
beforeLoad: async ({ location }) => {
  const publicRoutes = ['/', '/auth/login']
  if (publicRoutes.some(r => location.href.startsWith(r))) return
  
  const user = getRole()
  if (!user) {
    throw redirect({ to: '/auth/login', search: { redirect: location.href } })
  }
}

// routes/tim-penyusun.tsx
export const Route = createFileRoute('/tim-penyusun')({
  beforeLoad: requireRoleBeforeLoad(ROLES.TIM_PENYUSUN),
  component: TimPenyusunLayout,
})
```

---

## 3. Issues & Recommendations

### 🔴 HIGH PRIORITY

#### Issue 1: Business Logic Leakage in Pages

**Problem:**
```typescript
// pages/tim-penyusun/ManajemenSOP.tsx (Line ~150)
ids.forEach((sopId) => {
  setSopStatusOverride(sopId, 'Diajukan Evaluasi') // ❌ Business logic in page
})
```

**Impact:** Hard to test, violates separation of concerns.

**Fix:**
```typescript
// features/sop/hooks/useSopStatus.ts
export function useRequestEvaluasi() {
  const { mutateAsync } = useMutation({...})
  
  const requestEvaluasi = async (sopIds: string[]) => {
    await mutateAsync({ sopIds, status: 'Diajukan Evaluasi' })
    // Handle toast, audit, etc.
  }
  
  return { requestEvaluasi }
}

// pages/tim-penyusun/ManajemenSOP.tsx
const { requestEvaluasi } = useRequestEvaluasi() // ✅
```

---

#### Issue 2: Duplicate Type Definitions

**Problem:**
```typescript
// types/common.ts
export type StatusSOP = 'Draft' | 'Validasi' | 'Published'

// features/sop/types/common.ts
export type StatusSOP = 'Draft' | 'Validasi' | 'Published' // ❌ Duplicate

// features/evaluasi/types/common.ts
import type { StatusSOP } from '@/types/common' // ✅ Correct
```

**Recommendation:**
```
types/
└── common.ts           # ALL shared types
    ├── StatusSOP
    ├── StatusHasilEvaluasi
    ├── Role
    └── User

features/
└── [feature]/
    └── types/
        └── index.ts    # Re-export from @/types/common + feature-specific types
```

---

#### Issue 3: Inconsistent Feature Module Structure

**Problem:**
```
features/organisasi/     # Missing components/, types/
features/audit/          # Missing components/
features/sop/            # ✅ Complete structure
```

**Recommendation:** Enforce consistent structure:

```
features/[feature]/
├── index.ts             # Barrel export
├── types/
│   ├── index.ts         # Re-exports
│   └── [feature].ts     # Feature-specific types
├── services/
│   └── [feature].api.ts
├── hooks/
│   ├── use[Feature].ts
│   └── use[Feature]List.ts
└── components/          # Even if empty, add README
    └── README.md        # "No UI components yet"
```

---

### 🟡 MEDIUM PRIORITY

#### Issue 4: Empty `services/` Directory

**Problem:** `src/services/` exists but is empty. Services moved to `features/*/services/`.

**Fix:**
```bash
# Option 1: Remove it
rm -rf src/services

# Option 2: Add README
echo "# Services moved to features/*/services/" > src/services/README.md
```

---

#### Issue 5: Inconsistent Hook Naming

**Current:**
```typescript
useDaftarSOPFilters()    // Returns filter state
useDaftarSOPData()       // Returns filtered data
useSop()                 // Returns CRUD operations
useSopDetail()           // Returns single SOP
useDetailSopById()       // Also returns single SOP (confusing)
```

**Recommendation:**
```typescript
// Consistent pattern: use[Entity][Action]
useSopList(filters)      // ✅ Clear
useSopById(id)           // ✅ Clear
useSopMutations()        // ✅ CRUD operations
useSopFilters()          // ✅ Filter state
```

---

#### Issue 6: Constants Duplication

**Problem:**
```typescript
// utils/constants.ts
export const STATUS_SOP_ALL = ['Draft', 'Validasi', ...]
export const STATUS_BADGE_CONFIG = { Draft: 'gray', ... }

// features/sop/types/types.ts
export const SOP_STATUS_FILTER_OPTIONS = [...] // ❌ Duplicate
```

**Fix:**
```typescript
// utils/constants.ts
export const SOP = {
  STATUS: ['Draft', 'Validasi', 'Published'] as const,
  BADGE_CONFIG: { Draft: 'gray', ... },
  FILTER_OPTIONS: [...],
}

// Usage
import { SOP } from '@/utils/constants'
```

---

### 🟢 LOW PRIORITY

#### Issue 7: Pages vs Features Boundary

**Current Confusion:**
```typescript
// Some routes import from pages
import { ManajemenSOP } from '@/pages/tim-penyusun/ManajemenSOP'

// Others import directly from features
import { LoginForm } from '@/features/auth'
```

**Recommendation:** Choose ONE pattern:

**Option A: Pages as Composition Layer (Recommended)**
```
routes/ → pages/ → features/
```
```typescript
// routes/tim-penyusun.manajemen-sop.tsx
import { ManajemenSOP } from '@/pages/tim-penyusun/ManajemenSOP'

// pages/tim-penyusun/ManajemenSOP.tsx
import { useSop, SOPListCard } from '@/features/sop'
```

**Option B: Direct Feature Import**
```typescript
// routes/tim-penyusun.manajemen-sop.tsx
import { ManajemenSOP } from '@/features/sop/components/ManajemenSOP'
```

---

#### Issue 8: Zustand Selector Pattern

**Current:**
```typescript
// authStore.ts has extensive comments about correct usage

// ✅ Correct
const user = useAuthStore((state) => state.user)

// ❌ But this exists in codebase
const { user } = useAuthStore() // Causes unnecessary re-renders
```

**Fix:** Add ESLint rule:
```json
// .eslintrc.json
{
  "rules": {
    "zustand/no-direct-store-access": "error"
  }
}
```

---

## 4. Recommended Clean Structure

### 4.1 Proposed Structure

```
client/src/
├── routes/                    # TanStack Router (auto-generated aware)
│   ├── __root.tsx
│   ├── index.tsx
│   ├── auth/
│   │   └── login.tsx
│   ├── tim-penyusun/
│   │   ├── index.tsx
│   │   ├── manajemen-sop.tsx
│   │   └── ...
│   └── ...
│
├── pages/                     # Page composition layer
│   ├── tim-penyusun/
│   │   ├── ManajemenSOP.page.tsx
│   │   ├── DetailSOP.page.tsx
│   │   └── ...
│   ├── tim-evaluasi/
│   ├── kepala-opd/
│   └── ...
│
├── features/                  # Domain modules (ALL follow same structure)
│   ├── auth/
│   │   ├── index.ts
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   └── auth.ts
│   │   ├── services/
│   │   │   └── auth.api.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLogin.ts
│   │   │   └── useLogout.ts
│   │   └── components/
│   │       ├── LoginForm.tsx
│   │       └── AuthGuard.tsx
│   │
│   ├── sop/                   # ✅ Already good
│   ├── evaluasi/              # ✅ Already good
│   ├── tim/                   # ✅ Already good
│   ├── tte/                   # ✅ Already good
│   ├── audit/
│   │   ├── index.ts
│   │   ├── types/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── components/        # Add even if empty
│   └── organisasi/
│       ├── index.ts
│       ├── types/
│       ├── services/
│       ├── hooks/
│       └── components/        # Add
│
├── components/                # Shared UI
│   ├── ui/                    # Primitives (shadcn-style)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/                # Layout components
│   │   ├── RoleLayout.tsx
│   │   ├── PageHeader.tsx
│   │   └── ...
│   └── shared/                # Cross-feature components
│       ├── SOPCard.tsx
│       └── ...
│
├── stores/                    # Zustand stores
│   ├── authStore.ts
│   └── uiStore.ts
│
├── config/                    # App configuration
│   ├── api.config.ts
│   ├── query-client.ts
│   └── ...
│
├── types/                     # Shared types (single source)
│   ├── common.ts
│   ├── api.ts
│   └── index.ts
│
├── utils/                     # Utilities
│   ├── api-client.ts
│   ├── query-keys.ts
│   ├── constants.ts
│   ├── role.ts
│   └── ...
│
└── hooks/                     # Global hooks (optional)
    ├── useToast.ts
    ├── useDebounce.ts
    └── ...
```

---

### 4.2 File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page Components | `[Name].page.tsx` | `ManajemenSOP.page.tsx` |
| Feature Components | `[Name].tsx` | `LoginForm.tsx` |
| UI Components | `[name].tsx` | `button.tsx`, `dialog.tsx` |
| Hooks | `use[Name].ts` | `useAuth.ts`, `useSopList.ts` |
| Services | `[name].api.ts` | `sop.api.ts`, `auth.api.ts` |
| Types | `[name].ts` | `sop.ts`, `common.ts` |
| Routes | `[name].tsx` | `manajemen-sop.tsx` |

---

### 4.3 Import Rules

```typescript
// ✅ Allowed
import { useSop } from '@/features/sop'           // Via barrel export
import { Button } from '@/components/ui/button'    // Direct UI import
import type { Sop } from '@/types/common'          // Shared types
import { queryKeys } from '@/utils/query-keys'     // Utils

// ❌ Avoid
import { useSop } from '@/features/sop/hooks/useSop'  // Deep import
import { Sop } from '@/features/sop/types/sop'        // Deep import
```

---

## 5. Action Plan

### Phase 1: Quick Wins (1-2 hours)
- [ ] Remove empty `services/` directory
- [ ] Add README to incomplete feature modules (`audit/`, `organisasi/`)
- [ ] Centralize constants (remove duplicates)
- [ ] Add ESLint rules for Zustand selectors

### Phase 2: Type Consolidation (2-3 hours)
- [ ] Move all shared types to `types/common.ts`
- [ ] Update feature modules to re-export from `@/types`
- [ ] Remove duplicate type definitions

### Phase 3: Hook Refactoring (4-6 hours)
- [ ] Standardize hook naming (`useSopList`, `useSopById`)
- [ ] Extract business logic from pages to hooks
- [ ] Add integration tests for new hooks

### Phase 4: Structure Enforcement (2-3 hours)
- [ ] Complete `features/organisasi/components/`
- [ ] Complete `features/audit/components/`
- [ ] Add barrel exports (`index.ts`) to all features
- [ ] Document import rules in README

### Phase 5: Long-term (Optional)
- [ ] Consider migrating pages into features (if preferred)
- [ ] Add codegen for types from OpenAPI spec
- [ ] Implement module federation for large features

---

## 6. Clean Code Guidelines

### 6.1 Feature Module Checklist

```markdown
## Before marking a feature complete:

- [ ] `types/` - Domain types defined
- [ ] `services/` - API calls isolated
- [ ] `hooks/` - TanStack Query hooks + business logic
- [ ] `components/` - UI components (or README if none)
- [ ] `index.ts` - Barrel export with clear API
- [ ] Tests - Critical paths covered
```

### 6.2 Page Component Rules

```typescript
// ✅ DO: Compose feature hooks
function ManajemenSOP() {
  const filters = useSopFilters()
  const data = useSopList(filters)
  const { deleteSop } = useSopMutations()
  
  return <SopList data={data} onDelete={deleteSop} />
}

// ❌ DON'T: Direct API calls
function ManajemenSOP() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    fetch('/api/sop').then(r => r.json()).then(setData) // ❌
  }, [])
}
```

### 6.3 Hook Naming Convention

```typescript
// Data fetching
useSopList(params)
useSopById(id)
useSopDetail(id)

// Mutations
useSopMutations() // Returns { create, update, delete }
useCreateSop()
useUpdateSop()
useDeleteSop()

// Business logic
useSopPermissions()
useSopFilters()
useFilteredSops(sops, filters)
```

---

## 7. Conclusion

### Current State: ✅ **Good Foundation**

**Strengths:**
- Clear layer separation (routes → pages → features → components)
- Consistent use of TanStack Query for data fetching
- Well-organized feature modules (mostly)
- Strong TypeScript usage

**Areas for Improvement:**
- Remove business logic from pages
- Consolidate duplicate types/constants
- Complete incomplete feature modules
- Standardize naming conventions

**Estimated Refactoring Time:** 10-15 hours for full cleanup

**Priority:** Start with Phase 1 (quick wins), then Phase 2 (type consolidation). Phases 3-5 can be done incrementally.

---

## Appendix A: Example Clean Feature Module

```typescript
// features/sop/index.ts
export type { Sop, SopDetail, CreateSopRequest } from './types'
export { sopApi } from './services/sop.api'
export { useSopList, useSopById, useSopMutations } from './hooks'
export { SopListCard, SopDetailPanel } from './components'

// features/sop/hooks/useSopList.ts
export function useSopList(filters: SopFilters) {
  return useQuery({
    queryKey: queryKeys.sop.list(filters),
    queryFn: () => sopApi.findAll(filters),
    staleTime: 5 * 60 * 1000,
  })
}

// features/sop/hooks/useSopMutations.ts
export function useSopMutations() {
  const queryClient = useQueryClient()
  
  const create = useMutation({
    mutationFn: sopApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sop.all })
    },
  })
  
  return { create, /* update, delete */ }
}
```
