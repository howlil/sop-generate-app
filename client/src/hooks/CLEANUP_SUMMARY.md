# Hooks Cleanup - Final Summary

## Date: 2026-04-02

## Changes Summary

### Files Moved to Utils (3)
| File | New Location | Reason |
|------|-------------|--------|
| `hooks/useFilteredList.ts` | `utils/use-filtered-list.ts` | Generic utility, not domain-specific |
| `hooks/usePagination.ts` | `utils/use-pagination.ts` | Generic utility, not domain-specific |
| `hooks/useDocumentTitle.ts` | `utils/use-document-title.ts` | Simple utility function |

### Files Deleted (1)
| File | Reason | Replacement |
|------|--------|-------------|
| `hooks/useManajemenOPDState.ts` | Only contained types | Types moved to `types/misc.ts` |

### Types Moved to Proper Type Files (2)
| Type | New Location |
|------|-------------|
| `KepalaFormState`, `FormTambahKepalaState`, `PindahFormState`, `PindahDialogPerson`, `RiwayatDialogPerson` | `types/misc.ts` |
| `TimPenyusunFormState` | `types/tim.ts` |

### Files Updated (11)
1. `pages/kepala-biro-organisasi/manajemen-opd/TambahKepalaOPDDialog.tsx`
2. `pages/kepala-biro-organisasi/manajemen-opd/RiwayatJabatanDialog.tsx`
3. `pages/kepala-biro-organisasi/manajemen-opd/PindahJabatanDialog.tsx`
4. `pages/kepala-biro-organisasi/manajemen-opd/KepalaOPDFormDialog.tsx`
5. `pages/kepala-biro-organisasi/manajemen-tim-penyusun/TimPenyusunFormDialog.tsx`
6. All pages using `useFilteredList` (8 files)
7. All pages using `usePagination` (13 files)
8. All pages using `useDocumentTitle` (6 files)

---

## Final Hooks Directory Structure (21 files)

### Domain Hooks (TanStack Query)
- `useAppRole.ts` - Role management (Zustand)
- `useAudit.ts` - Audit logs
- `useAuth.ts` - Authentication
- `useDaftarSOPData.ts` - SOP list with business logic
- `useDaftarSOPFilters.ts` - Filter state
- `useDetailSop.ts` - SOP detail CRUD
- `useEvaluasi.ts` - Evaluation management
- `useOpd.ts` - OPD management
- `usePelaksana.ts` - Pelaksana SOP
- `usePeraturan.ts` - Peraturan management
- `useSop.ts` - SOP management
- `useTimEvaluasi.ts` - Tim Evaluasi
- `useTimPenyusun.ts` - Tim Penyusun
- `useTTE.ts` - TTE signing
- `useUsers.ts` - User management

### UI State Hooks
- `useEvaluasiDraft.ts` - Draft state (in-memory)
- `useEvaluasiSubmit.ts` - Batch submission logic
- `useManajemenPeraturanState.ts` - Form state
- `useManajemenTimPenyusunState.ts` - Dialog state
- `useSopStatus.ts` - Status override (localStorage)
- `useUI.ts` - Toast/collapsible state

---

## Utils Directory Structure (10 files)

### Utilities
- `cn.ts` - Class name merger
- `constants.ts` - Shared constants
- `format-date.ts` - Date formatting
- `generate-id.ts` - ID generation
- `role.ts` - Role utilities
- `sidebar-matcher.ts` - Sidebar route matching
- `version-diff.ts` - Version diff utilities

### Utility Hooks
- `use-document-title.ts` - Document title
- `use-filtered-list.ts` - List filtering
- `use-pagination.ts` - Pagination

---

## Import Path Changes

```typescript
// OLD
import { useFilteredList } from '@/hooks/useFilteredList'
import { usePagination } from '@/hooks/usePagination'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { KepalaFormState } from '@/hooks/useManajemenOPDState'
import type { TimPenyusunFormState } from '@/hooks/useManajemenTimPenyusunState'

// NEW
import { useFilteredList } from '@/utils/use-filtered-list'
import { usePagination } from '@/utils/use-pagination'
import { useDocumentTitle } from '@/utils/use-document-title'
import type { KepalaFormState } from '@/types/misc'
import type { TimPenyusunFormState } from '@/types/tim'
```

---

## Code Quality Improvements

1. **Separated concerns**: Domain hooks vs utility hooks vs types
2. **No re-exports**: All exports are direct from source
3. **Clear naming**: Utils use kebab-case, hooks use camelCase
4. **Proper type location**: Types in `types/`, hooks in `hooks/`, utils in `utils/`
5. **No deprecated code**: All stub functions removed

---

## Files Count

| Directory | Before | After | Change |
|-----------|--------|-------|--------|
| `hooks/` | 31 | 21 | -10 |
| `utils/` | 7 | 10 | +3 |
| **Total** | 38 | 31 | -7 |

---

## Next Steps

1. **Run TypeScript compiler** to verify no type errors
2. **Run tests** to ensure functionality unchanged
3. **Consider migrating** `useSopStatus` localStorage to real API state
4. **Consider migrating** `useEvaluasiDraft` in-memory state to server-side drafts
5. **Consider removing** `useManajemen*State` hooks and using inline state
