# CONVENTIONS.md — Code Style and Patterns

## Naming Conventions

### Files
- React components: `PascalCase.tsx` (e.g., `BuatSOPDialog.tsx`, `TTESignatureBlock.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g., `useDaftarSOPData.ts`, `useTTESignature.ts`)
- Stores: `kebab-case-store.ts` (e.g., `audit-log-store.ts`, `sop-meta-store.ts`)
- Types: `kebab-case.ts` (e.g., `sop.ts`, `tte.ts`, `verifikasi-batch.ts`)
- Constants: `kebab-case.ts` (e.g., `roles.ts`, `routes.ts`, `status-badge-config.ts`)
- Data files: `kebab-case.ts` (e.g., `sop-daftar.ts`, `evaluasi-tahunan.ts`)
- Seed files: `kebab-case.json`
- Pages: `PascalCase.tsx` organized by role (e.g., `DaftarSOP.tsx`, `ManajemenPeraturan.tsx`)
- Route files: `dot-separated.tsx` following TanStack Router convention

### Variables & Functions
- Variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE` for module-level constants
- React components: `PascalCase` function declarations
- Custom hooks: `use` prefix + `PascalCase` (e.g., `useSOPStatus`, `useEvaluasi`)
- Domain functions: descriptive camelCase (e.g., `getSOPStatus`, `computeEvaluasiResult`)

### Types & Interfaces
- Types/Interfaces: `PascalCase` (e.g., `SOPDetail`, `VerifikasiBatch`, `TTESignature`)
- No `I` prefix on interfaces
- Domain terms use Indonesian language (e.g., `Pelaksana`, `Peraturan`, `TimPenyusun`)

### NestJS Server
- Modules: `PascalCase` + `.module.ts`
- Controllers: `PascalCase` + `.controller.ts`
- Services: `PascalCase` + `.service.ts`
- DTOs: `PascalCase` + `.dto.ts`
- Guards/Interceptors: `PascalCase` + `.guard.ts` / `.interceptor.ts`

---

## Code Style

### TypeScript
- `strict: true` on both client and server
- No default exports (named exports only)
- No barrel files (`index.ts` re-exports)
- Explicit return types on service methods; inferred on React components
- Path alias `@/` maps to `src/` on client

### Client (React)
- No semicolons (Prettier config)
- Prettier for formatting
- `cn()` utility for conditional class merging (clsx + tailwind-merge)
- `cva` (class-variance-authority) for variant-based component styling
- `forwardRef` pattern for reusable UI components

### Server (NestJS)
- Semicolons required (Prettier config)
- Prettier for formatting
- Decorators for DI, routing, validation

### Import Order (Client — 7 groups)
1. React core imports
2. Third-party libraries
3. TanStack Router / Query
4. UI component imports (`@/components/ui/`)
5. Feature component imports (`@/components/`)
6. Hooks (`@/hooks/`)
7. Types, constants, data, lib utilities

### Import Order (Server — 3 groups)
1. Node built-ins
2. NestJS / third-party
3. Local modules

---

## Patterns

### Component Design
```tsx
// cva + cn + forwardRef pattern
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva("base-classes", {
  variants: { variant: { default: "...", destructive: "..." } },
  defaultVariants: { variant: "default" }
})

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant }), className)} {...props} />
  )
)
Button.displayName = "Button"
```

### State Management
```ts
// Zustand store with persist + dual access pattern
import { create } from "zustand"
import { persist } from "zustand/middleware"

const useAuditLogStore = create(persist(
  (set, get) => ({
    logs: [],
    addLog: (log) => set((s) => ({ logs: [...s.logs, log] })),
  }),
  { name: "audit-log-store" }
))

// Hook access (React components)
export const useAuditLog = () => useAuditLogStore((s) => s.logs)

// Imperative access (outside React)
export const auditLogStore = useAuditLogStore
```

### Custom Hooks
```ts
// Feature hook: encapsulates data + state + actions
export function useDaftarSOPData() {
  const [filter, setFilter] = useState<FilterState>(defaultFilter)
  const data = useMemo(() => getFilteredSOPs(filter), [filter])
  return { data, filter, setFilter }
}
```

### Domain Logic
- Pure functions in `src/lib/domain/` (no React dependencies)
- Domain functions receive typed inputs, return typed outputs
- Examples: `getSOPStatus()`, `computeEvaluasiResult()`, `getTTEState()`

---

## Error Handling

### Client
- Try/catch in async handlers → `toast.error(message)` via GlobalToast
- No uncaught promise rejections
- Form errors via react-hook-form + zod validation

### Server
- NestJS built-in exceptions (`NotFoundException`, `BadRequestException`, etc.)
- `GlobalExceptionFilter` in `src/common/` normalizes all error responses
- `ResponseInterceptor` wraps successful responses in consistent shape

---

## Logging

### Server
- Winston with 3 transports: console, file (combined), file (errors)
- Structured JSON logs in production
- Request/response logging via middleware

### Client
- No logging framework; errors surface via toast notifications

---

## Comments
- File-level JSDoc blocks in Indonesian (domain context)
- Inline JSDoc on exported functions/types where behavior isn't obvious
- Implementation comments in English for technical decisions
