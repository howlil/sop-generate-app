# Conventions

## Languages & Formatting

- TypeScript throughout (strict mode on both server and client)
- Prettier: `singleQuote: true`, `trailingComma: 'all'` (inferred from code style)
- Indentation: 2 spaces
- File extensions: `.ts` for server, `.tsx` for React components

## Naming Conventions

### Server
| Construct | Convention | Example |
|---|---|---|
| Classes | PascalCase | `UserService`, `UserController` |
| Interfaces | PascalCase with `I` prefix | `IUserRepository`, `IBaseRepository` |
| DTOs | PascalCase + Dto suffix | `CreateUserDto`, `PaginatedResponseDto` |
| Methods | camelCase | `findAll`, `findById`, `create` |
| Files | kebab-case | `user.service.ts`, `http-exception.filter.ts` |
| Constants | — | not yet present |
| Env vars | SCREAMING_SNAKE_CASE | `PORT`, `NODE_ENV`, `ALLOWED_ORIGINS` |

### Client
| Construct | Convention | Example |
|---|---|---|
| Components | PascalCase | `UserController`, `SOPListCard` |
| Hooks | camelCase with `use` prefix | `useDaftarSOPData`, `useTTESignature` |
| Stores | camelCase, `-store.ts` files | `useAppStore`, `useVerifikasiBatchStore` |
| Types/interfaces | PascalCase | `RoleKey`, `VerifikasiBatch` |
| Constants objects | SCREAMING_SNAKE_CASE | `ROLES`, `ROUTES`, `ROLE_LABELS` |
| Route files | `{role}.{page}.tsx` dot-notation | `tim-penyusun.daftar-sop.tsx` |
| Utility files | kebab-case | `format-date.ts`, `generate-id.ts` |

## Import Style

### Server
- No path aliases; relative imports used
- Import order: NestJS decorators → external libs → internal modules

### Client
- Path alias `@/` maps to `src/`
- Pattern: `@/components/ui/button`, `@/lib/stores/app-store`
- Named exports preferred over default exports (except route files)

## Error Handling

### Server
- Services throw typed NestJS exceptions: `NotFoundException`, `ConflictException`, `BadRequestException`
- `GlobalExceptionFilter` catches all — formats uniform JSON:
  ```json
  { "success": false, "statusCode": 404, "message": "...", "errors": null, "path": "...", "timestamp": "..." }
  ```
- Validation errors from `ValidationPipe` return `errors: string[]`, `message: "Validasi gagal"`

### Client
- No centralized error boundary for async errors yet
- Toast notifications via `showToast()` from `app-store.ts`
- Route errors handled by `route-error.tsx` component
- Not-found: `not-found.tsx` component

## Logging (Server)
- Winston with `nest-winston`
- Two transports: console + file (inferred from `winston.config.ts`)
- Logger injected at bootstrap; `Logger` from NestJS used in filters

## Comment Style
- Server: English JSDoc for public DTOs and interfaces
- Client: Mix of English and Indonesian comments
  - Indonesian JSDoc blocks common: `/** Kompatibel dengan format lama... */`
  - Domain files have Indonesian JSDoc: `/** Domain: logika TTE ... */`
- Internal implementation comments generally in Indonesian

## Patterns

### Server: Module Structure Pattern
Each domain module follows identical structure:
```
modules/{domain}/
  controller/{domain}.controller.ts
  service/{domain}.service.ts
  repository/{domain}.repository.interface.ts (with `any` types)
  repository/{domain}.repository.ts (concrete Prisma implementation)
  dto/create-{domain}.dto.ts
  dto/update-{domain}.dto.ts
  {domain}.module.ts
```

### Server: Repository Interface Pattern
Interfaces use `any` return types (tech debt — not tied to generated Prisma types):
```ts
export interface IUserRepository {
  findAll(skip?: number, take?: number): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  // ...
}
```

### Client: Zustand Store Pattern
Stores export both hook (for React components) and plain getter/setter functions (for use outside React):
```ts
export const useAppStore = create<AppState>()(persist(...))

// Imperative accessors for non-component code:
export function getRole(): RoleKey | null { return useAppStore.getState().role }
export function setRole(role: RoleKey): void { useAppStore.getState().setRole(role) }
```

### Client: Route Guard Pattern
```ts
export const Route = createFileRoute('/tim-penyusun')({
  beforeLoad: requireRoleBeforeLoad(ROLES.TIM_PENYUSUN),
  component: TimPenyusunLayout,
})
```

### Client: Hook Composition Pattern
Hooks orchestrate stores and domain logic; components receive data + handlers:
```ts
export function useSopMeta(sopId: string) {
  const store = useSopMetaStore()
  // reads store, computes derived state, returns typed result
}
```
