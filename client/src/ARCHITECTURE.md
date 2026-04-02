# Architecture Pattern: Services vs Hooks

## Overview

This document defines the architectural pattern for API integration in this React application, clarifying the separation between `services/` and `hooks/` layers.

---

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Component (UI Layer)                                           │
│  - Renders UI                                                   │
│  - Handles user interactions                                    │
│                                                                 │
│  const { data, isLoading, create } = useSop()                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ uses
┌─────────────────────────────────────────────────────────────────┐
│  Hooks Layer (React Integration)                                │
│  - useQuery / useMutation (TanStack Query)                      │
│  - Loading & error state management                             │
│  - Toast notifications                                          │
│  - Query invalidation                                           │
│  - Business logic & validation                                  │
│                                                                 │
│  export function useSop() {                                     │
│    const { data, isLoading } = useQuery(...)                    │
│    const mutation = useMutation(...)                            │
│    return { list: data, isLoading, create: mutation.mutate }    │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓ calls
┌─────────────────────────────────────────────────────────────────┐
│  Services Layer (API Client)                                    │
│  - Pure HTTP calls                                              │
│  - No React dependencies                                        │
│  - Framework agnostic                                           │
│  - Returns Promise<T>                                           │
│                                                                 │
│  export const sopApi = {                                        │
│    findAll: () => apiClient.get<Sop[]>('/sop'),                 │
│    create: (payload) => apiClient.post<Sop>('/sop', payload)    │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓ communicates with
┌─────────────────────────────────────────────────────────────────┐
│  REST API Server                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Responsibilities

### `services/*.api.ts` - API Client Layer

**Purpose:** Pure HTTP client for API endpoints

**Responsibilities:**
- HTTP method calls (GET, POST, PUT, PATCH, DELETE)
- Request/response type definitions
- URL construction and query parameters
- Error throwing (let hooks handle error UI)

**DOES NOT:**
- ❌ Use React hooks
- ❌ Manage loading states
- ❌ Show toast notifications
- ❌ Invalidate queries
- ❌ Contain business logic

**Example:**
```typescript
// ✅ services/sop.api.ts
export const sopApi = {
  findAll: (params?: { opdId?: string }) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<Sop[]>(`/sop${query}`)
  },
  
  create: (payload: CreateSopRequest) =>
    apiClient.post<Sop>('/sop', payload),
}
```

---

### `hooks/use*.ts` - React Integration Layer

**Purpose:** Bridge between API and UI components

**Responsibilities:**
- Use TanStack Query (`useQuery`, `useMutation`)
- Manage loading/error states
- Show toast notifications on success/error
- Invalidate queries after mutations
- Add business logic & validation
- Coordinate multiple API calls

**MUST ADD VALUE beyond just calling the API:**
- ✅ Loading state handling
- ✅ Error handling with user feedback
- ✅ Query invalidation logic
- ✅ Business logic/domain rules
- ✅ State coordination across queries

**Example:**
```typescript
// ✅ hooks/useSop.ts
export function useSop(params?: { opdId?: string }) {
  const queryClient = useQueryClient()
  
  const { data: list = [], isLoading, error } = useQuery({
    queryKey: queryKeys.sopList(params),
    queryFn: () => sopApi.findAll(params),
    staleTime: 5 * 60 * 1000,
  })
  
  const createMutation = useMutation({
    mutationFn: (payload) => sopApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sop })
      showToast('SOP berhasil dibuat', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal membuat SOP', 'error')
    },
  })
  
  return {
    list,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}
```

---

## Decision Matrix: When to Create a Hook

### ✅ CREATE Hook When:

1. **Multiple components use the same query/mutation pattern**
   ```typescript
   // ✅ Good: Multiple components need SOP list with same config
   export function useSop() { ... }
   ```

2. **Complex state coordination needed**
   ```typescript
   // ✅ Good: Coordinates multiple mutations + state
   export function useEvaluasiSubmit(config) {
     // Manages batch state
     // Handles check-all logic
     // Coordinates multiple API calls
   }
   ```

3. **Business logic + API combined**
   ```typescript
   // ✅ Good: Adds domain logic
   export function usePelaksana(opdId?: string) {
     const user = useAuthStore((s) => s.user)
     const effectiveOpdId = opdId || user?.opdId // Business logic
     
     return useQuery({
       queryKey: queryKeys.pelaksanaByOpd(effectiveOpdId || ''),
       queryFn: () => sopApi.findPelaksana(effectiveOpdId || ''),
       enabled: !!effectiveOpdId, // Conditional logic
     })
   }
   ```

### ❌ DON'T Create Hook When:

1. **Simple wrapper with no added value**
   ```typescript
   // ❌ Bad: Just wraps useQuery with no value add
   export function usePengajuanEvaluasiList() {
     return useQuery({
       queryKey: queryKeys.evaluasiList(),
       queryFn: () => evaluasiApi.findAll(),
     })
   }
   
   // ✅ Better: Component uses useQuery directly
   const { data } = useQuery({
     queryKey: queryKeys.evaluasiList(),
     queryFn: () => evaluasiApi.findAll(),
   })
   ```

2. **Only used in one place**
   ```typescript
   // ❌ Bad: Single usage, no abstraction needed
   // Component can call useQuery directly
   ```

3. **Incomplete implementation**
   ```typescript
   // ❌ Bad: Component expects complex API, hook returns simple query
   // Component expects: { setSopList, eligibleSopsForEvaluasi, filteredList }
   // Hook returns: { data, isLoading, error }
   // This is a broken abstraction!
   ```

---

## Anti-Patterns to Avoid

### 1. Thin Wrapper Anti-Pattern

```typescript
// ❌ BAD: Adds no value
export function useDaftarSOPData(opdId?: string) {
  return useQuery({
    queryKey: queryKeys.sopList(opdId ? { opdId } : undefined),
    queryFn: () => sopApi.findAll(opdId ? { opdId } : undefined),
  })
}

// ✅ Component can use directly:
const { data } = useQuery({
  queryKey: queryKeys.sopList({ opdId }),
  queryFn: () => sopApi.findAll({ opdId }),
})
```

### 2. Broken Abstraction Anti-Pattern

```typescript
// ❌ BAD: Interface mismatch
// Hook returns:
export function useDaftarSOPData() {
  return useQuery({ ... }) // Returns { data, isLoading, error }
}

// Component expects:
const { setSopList, eligibleSopsForEvaluasi, filteredList } = useDaftarSOPData()
// 💥 Type error! These don't exist!
```

### 3. Direct Store Mutation Anti-Pattern

```typescript
// ❌ BAD: Bypasses React reactivity
export function useAppRole() {
  const setRole = (newRole: RoleKey) => {
    useAuthStore.getState().setUser({ ...user, peran: newRole })
  }
}

// ✅ Better: Export action from store
export function useAppRole() {
  const setRole = useAuthStore((s) => s.setRole)
}
```

---

## Migration Guide: Removing Thin Wrappers

### Before (Thin Wrapper):
```typescript
// hooks/usePengajuanEvaluasi.ts
export function usePengajuanEvaluasiList() {
  return useQuery({
    queryKey: queryKeys.evaluasiList(),
    queryFn: () => evaluasiApi.findAll(),
  })
}

// Component
import { usePengajuanEvaluasiList } from '@/hooks/usePengajuanEvaluasi'
const { list } = usePengajuanEvaluasiList()
```

### After (Direct Usage):
```typescript
// Component
import { useQuery } from '@tanstack/react-query'
import { evaluasiApi } from '@/services/evaluasi.api'
import { queryKeys } from '@/services/queryKeys'

const { data: pengajuanList = [] } = useQuery({
  queryKey: queryKeys.evaluasiList(),
  queryFn: () => evaluasiApi.findAll(),
  staleTime: 3 * 60 * 1000,
})
```

---

## File Organization

```
client/src/
├── services/
│   ├── api.ts              # Base API client (axios wrapper)
│   ├── sop.api.ts          # SOP domain API calls
│   ├── evaluasi.api.ts     # Evaluasi domain API calls
│   └── queryKeys.ts        # TanStack Query keys (centralized)
│
├── hooks/
│   ├── useSop.ts           # ✅ Good: Adds value
│   ├── useEvaluasi.ts      # ✅ Good: Business logic + mutations
│   ├── useEvaluasiSubmit.ts# ✅ Good: Complex state coordination
│   └── useDocumentTitle.ts # ✅ Good: Utility hook
│
└── types/
    ├── sop.ts              # Type definitions
    └── evaluasi.ts
```

---

## Testing Strategy

### Services Layer (Unit Tests)
```typescript
// services/sop.api.test.ts
describe('sopApi', () => {
  it('findAll constructs correct URL with params', () => {
    const result = sopApi.findAll({ opdId: '123' })
    expect(apiClient.get).toHaveBeenCalledWith('/sop?opdId=123')
  })
})
```

### Hooks Layer (Component Tests)
```typescript
// hooks/useSop.test.tsx
describe('useSop', () => {
  it('shows toast on successful creation', async () => {
    const { result } = renderHook(() => useSop(), { wrapper })
    await result.current.create({ judul: 'Test SOP' })
    expect(showToast).toHaveBeenCalledWith('SOP berhasil dibuat', 'success')
  })
})
```

---

## Checklist for New Hooks

Before creating a new hook, ask:

- [ ] Does this add value beyond calling `useQuery` directly?
- [ ] Will multiple components use this?
- [ ] Does it include error handling with toast notifications?
- [ ] Does it handle query invalidation?
- [ ] Is there business logic that belongs here?
- [ ] Is the API complete and matching component expectations?
- [ ] Is it properly typed with TypeScript?
- [ ] Does it have JSDoc documentation?

If you answered **NO** to most questions, **don't create the hook** - use `useQuery` directly in the component.

---

## Summary

| Layer | Purpose | Dependencies | Returns |
|-------|---------|-------------|---------|
| `services/` | HTTP client | None (pure) | `Promise<T>` |
| `hooks/` | React integration | React, TanStack Query | `{ data, isLoading, mutate }` |
| `components/` | UI rendering | Hooks | JSX |

**Golden Rule:** Hooks must add **measurable value** beyond what a component could do with `useQuery` directly.

---

**Date:** 2026-04-02  
**Status:** Approved  
**Review:** Principal Code Reviewer
