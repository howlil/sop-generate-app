# Quick Task: Migrate from withMutationToast to useToast

**Created:** 2026-04-03  
**Priority:** Medium (follows API-UI-UTILS-ANALYSIS.md recommendations)  
**Estimated Time:** 2-3 hours  

---

## Objective

Migrate all 11 feature hooks from deprecated `withMutationToast` pattern to direct `useToast()` usage.

---

## Files to Migrate

| # | File | Mutations to Migrate |
|---|------|---------------------|
| 1 | `features/auth/hooks/useAuth.ts` | 1 |
| 2 | `features/auth/hooks/useUsers.ts` | 3 |
| 3 | `features/tte/hooks/useTTE.ts` | 8 |
| 4 | `features/sop/hooks/useSop.ts` | 3 |
| 5 | `features/sop/hooks/usePelaksana.ts` | 3 |
| 6 | `features/sop/hooks/useDetailSop.ts` | 13 |
| 7 | `features/tim/hooks/useTimPenyusun.ts` | 3 |
| 8 | `features/tim/hooks/useTimEvaluasi.ts` | 2 |
| 9 | `features/organisasi/hooks/usePeraturan.ts` | 4 |
| 10 | `features/organisasi/hooks/useOpd.ts` | 3 |
| 11 | `features/evaluasi/hooks/useEvaluasi.ts` | 3 |

**Total:** 47 mutations to migrate

---

## Migration Pattern

### Before (deprecated)
```typescript
import { withMutationToast } from '@/utils/handleApi'

export function useCreateSop() {
  return useMutation({
    mutationFn: createSop,
    ...withMutationToast('SOP berhasil dibuat', 'Gagal membuat SOP'),
  })
}
```

### After (recommended)
```typescript
import { useToast } from '@/utils/ui'

export function useCreateSop() {
  const { showToast } = useToast()
  
  return useMutation({
    mutationFn: createSop,
    onSuccess: () => showToast('SOP berhasil dibuat', 'success'),
    onError: (error) => showToast(error.message, 'error'),
  })
}
```

---

## Success Criteria

✅ All 11 files migrated  
✅ No more imports of `withMutationToast`  
✅ Build passing  
✅ STATE.md updated  

---

## Out of Scope

- Removing `handleApi.ts` (keep for backward compatibility during transition)
- Migrating `withToast` wrapper (different pattern, lower priority)
- Adding tests (existing tests should cover)
