# UI Patterns & Best Practices

**Last Updated:** 2026-04-03  
**Status:** ✅ Active  
**Scope:** Client-side React components and hooks

---

## Toast Notifications

### ✅ CORRECT Pattern

```typescript
import { useToast } from '@/utils/ui'

function MyComponent() {
  const { showToast } = useToast()
  
  const handleSuccess = () => {
    showToast('Berhasil!', 'success')
  }
  
  const handleError = (error: Error) => {
    showToast(error.message || 'Terjadi kesalahan', 'error')
  }
  
  return (
    <Button onClick={handleSuccess}>
      Click me
    </Button>
  )
}
```

### ❌ WRONG Patterns

```typescript
// ❌ Direct store access (deprecated)
import { showToast } from '@/stores/uiStore'
showToast('Message', 'success')

// ❌ Deprecated wrapper (deprecated)
import { withMutationToast } from '@/utils/handleApi'
useMutation({
  ...withMutationToast('Success', 'Error')
})

// ❌ Old pattern with spread (deprecated)
useMutation({
  ...withMutationToast('Success', 'Error'),
  onSuccess: () => { ... }
})
```

### Migration Guide

If you see `withMutationToast`, replace with:

```typescript
// Before
import { withMutationToast } from '@/utils/handleApi'

useMutation({
  mutationFn: createSop,
  ...withMutationToast('SOP berhasil dibuat', 'Gagal membuat SOP'),
})

// After
import { useToast } from '@/utils/ui'

const { showToast } = useToast()

useMutation({
  mutationFn: createSop,
  onSuccess: () => showToast('SOP berhasil dibuat', 'success'),
  onError: (error) => showToast(error.message || 'Gagal membuat SOP', 'error'),
})
```

---

## Zustand Store Access

### ✅ CORRECT Pattern

```typescript
// In components - use selectors
const user = useAuthStore((state) => state.user)
const setUser = useAuthStore((state) => state.setUser)

// With shallow comparison for objects
import { shallow } from 'zustand/shallow'
const { user, theme } = useAppStore(
  (state) => ({ user: state.user, theme: state.theme }),
  shallow
)

// Outside components (services, utils)
const user = useAuthStore.getState().user
```

### ❌ WRONG Patterns

```typescript
// ❌ Direct destructuring (causes unnecessary re-renders)
const { user, theme } = useAppStore()

// ❌ Entire store subscription
const state = useAppStore()
console.log(state.user) // Re-renders on ANY state change

// ❌ Direct store access in components
const user = useAuthStore.user // Won't work!
```

---

## TanStack Query Patterns

### ✅ CORRECT Pattern

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/utils/query-keys'

// Query
function useSop(id: string) {
  return useQuery({
    queryKey: queryKeys.sopById(id),
    queryFn: () => sopApi.findById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutation with invalidation
function useCreateSop() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  
  return useMutation({
    mutationFn: (data) => sopApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sops })
      showToast('SOP berhasil dibuat', 'success')
    },
    onError: (error) => showToast(error.message, 'error'),
  })
}
```

### ❌ WRONG Patterns

```typescript
// ❌ Flat query keys
useQuery(['getSopById'], fetchSop)

// ✅ CORRECT: Hierarchical keys
useQuery(['sops', id], fetchSop)

// ❌ No staleTime (refetches on every mount)
useQuery(['sops'], fetchSops)

// ✅ CORRECT: With staleTime
useQuery({
  queryKey: ['sops'],
  queryFn: fetchSops,
  staleTime: 5 * 60 * 1000,
})

// ❌ Broad invalidation (invalidates EVERYTHING)
queryClient.invalidateQueries()

// ✅ CORRECT: Targeted invalidation
queryClient.invalidateQueries({ queryKey: ['sops'] })
```

---

## Component Structure

### ✅ CORRECT Pattern

```typescript
import { useState, useMemo } from 'react'
import { useToast } from '@/utils/ui'

interface MyComponentProps {
  title: string
  items: string[]
}

export function MyComponent({ title, items }: MyComponentProps) {
  const { showToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [items, searchQuery])
  
  const handleClick = () => {
    showToast('Clicked!', 'success')
  }
  
  return (
    <div>
      <h1>{title}</h1>
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Button onClick={handleClick}>
        Click me
      </Button>
      <ul>
        {filteredItems.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Component Size Guidelines

| Type | Max Lines | Action if Exceeded |
|------|-----------|-------------------|
| Function | 50 | Extract helper |
| Component | 100 | Split into sub-components |
| Hook | 80 | Extract sub-hooks |
| File | 300 | Split into modules |

---

## Naming Conventions

### ✅ CORRECT

```typescript
// Variables - descriptive
const userProfile = ...
const orderTotal = ...
const isValidated = ...

// Functions - intent-revealing
const handleSopSubmit = ...
const calculateOrderTotal = ...
const validateUserInput = ...

// Hooks - use prefix
const useSopList = ...
const useSopById = ...
const useSopMutations = ...

// Components - PascalCase
const SopCard = ...
const SopList = ...
```

### ❌ WRONG

```typescript
// ❌ Ambiguous
const data = ...
const temp = ...
const info = ...

// ❌ Generic
const handleClick = ... // Which click?
const doSomething = ... // What?
const processData = ... // What process?

// ❌ Missing use prefix
const sopList = ... // Should be useSopList
```

---

## File Organization

```
client/src/
├── features/           # Domain modules
│   ├── sop/
│   │   ├── index.ts          # Barrel export
│   │   ├── types/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── components/
│   └── ...
├── components/         # Shared UI
│   ├── ui/            # Primitives
│   ├── layout/        # Layouts
│   └── shared/        # Cross-feature
├── utils/             # Utilities
│   ├── api-client.ts
│   ├── ui.ts          # useToast hook
│   └── query-keys.ts
└── stores/            # Zustand stores
    ├── authStore.ts
    └── uiStore.ts
```

---

## Common Patterns

### Optimistic Update

```typescript
const mutation = useMutation({
  mutationFn: updateSop,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['sops', id] })
    const previous = queryClient.getQueryData(['sops', id])
    queryClient.setQueryData(['sops', id], newData)
    return { previous }
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['sops', id], context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['sops'] })
  },
})
```

### Derived State

```typescript
// ✅ CORRECT: useMemo
const filteredList = useMemo(() => {
  return list.filter(item => item.status === filter)
}, [list, filter])

// ❌ WRONG: useState + useEffect
const [filteredList, setFilteredList] = useState([])
useEffect(() => {
  setFilteredList(list.filter(item => item.status === filter))
}, [list, filter])
```

### Loading States

```typescript
// ✅ CORRECT: Granular loading
function SopList() {
  const { data, isLoading } = useSops()
  
  if (isLoading) return <SkeletonList />
  if (!data?.length) return <EmptyState />
  
  return <div>{data.map(sop => <SopCard key={sop.id} sop={sop} />)}</div>
}

// ❌ WRONG: Page-level spinner
if (isLoading) return <PageSpinner />
```

---

## References

- [CLIENT_STRUCTURE_ANALYSIS.md](./.planning/phases/CLIENT_STRUCTURE_ANALYSIS.md)
- [API-UI-UTILS-ANALYSIS.md](./.planning/quick/API-UI-UTILS-ANALYSIS.md)
- [TanStack Query Docs](https://tanstack.com/query)
- [Zustand Docs](https://zustand-demo.pmnd.rs)

---

*Generated: 2026-04-03*  
*Maintained by: Frontend Guild*
