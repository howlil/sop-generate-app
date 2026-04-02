# Quick Task: Fix State Duplication in useDaftarSOPData

## Objective
Fix P2 issue identified in frontend audit report: State duplication in `useDaftarSOPData` hook.

## Changes Made

### 1. Refactored `useDaftarSOPData` Hook
**File:** `client/src/hooks/sop/useDaftarSOPData.ts`

**Before:**
- Had local state `localSopList` that duplicated TanStack Query data
- Created two sources of truth for SOP list
- `setSopList` function allowed manual state updates

**After:**
- All state is now derived from `useSop()` hook (TanStack Query)
- Removed `localSopList` state
- Removed `setSopList` function
- Added clear documentation note about single source of truth

**Benefits:**
- ✅ Single source of truth (TanStack Query cache)
- ✅ No sync issues between local and server state
- ✅ Simpler code (removed 15+ lines)
- ✅ Follows React best practices for derived state

### 2. Updated `ManajemenSOP.tsx` Component
**File:** `client/src/pages/tim-penyusun/ManajemenSOP.tsx`

**Changes:**
- Removed `setSopList` from hook destructuring
- Added `useSop` import to access mutations directly
- Updated `confirmAjukanEvaluasiBulk` to use `setSopStatusOverride` only (no local state update)
- Simplified `BuatSOPDialog` onSuccess handler (removed manual list update)

### 3. Fixed Import Issues (Side-effect Cleanup)
During the build process, discovered and fixed 30+ broken imports from previous constants refactor:

**Fixed imports:**
- `@/utils/constants/ui` → `@/utils/constants`
- `@/utils/constants/routes` → `@/utils/constants`
- `@/utils/constants/evaluasi` → `@/utils/constants`
- `@/utils/constants/status-badge-config` → `@/utils/constants`
- `@/utils/constants/pipeline-ia` → `@/utils/constants`
- `@/services/api` → `@/utils/api-client`
- `@/services/queryKeys` → `@/utils/query-keys`
- `@/utils` → `@/utils/generate-id`

**Files fixed:**
- 14 route files
- 10 service files (api-client import path)
- 5 page files
- 3 component files
- 1 hook file (useAppRole.ts - CONSTANTS import)

**Pre-existing issues discovered:**
- TTE hooks missing exports (`hashPin`, `setTTEProfile`, `getTTEVerificationSuccessUrl`, `getValidasiPengesahanUrl`)
- These are unrelated to this refactor and should be fixed separately

## Testing

### Build Status
Build was failing due to pre-existing TTE hook issues. Core changes are:
- ✅ TypeScript compilation passes for modified files
- ✅ No new type errors introduced
- ✅ Logic is simpler and more maintainable

### Manual Testing Required
Before deployment, manually test:
1. **SOP List filtering** - Search, status filter, date range
2. **Submit for evaluation** - Bulk submit flow
3. **Create new SOP** - Navigation to detail page
4. **Status updates** - Verify TanStack Query cache invalidation works

## Architecture Impact

### State Management
**Before:**
```
TanStack Query → useSop() → sopList
                    ↓
            useDaftarSOPData → localSopList (duplicate!)
                    ↓
            filteredList (from localSopList OR sopList)
```

**After:**
```
TanStack Query → useSop() → sopList
                    ↓
            useDaftarSOPData → filteredList (derived from sopList)
```

### Pattern Alignment
This change aligns with the existing architecture pattern used throughout the codebase:
- ✅ Server state in TanStack Query
- ✅ Client state in Zustand (auth, UI)
- ✅ Derived state via useMemo
- ✅ No localStorage for tokens (HttpOnly cookies)

## Related Issues Fixed

### Frontend Audit Findings
This fix addresses the **P2 severity** issue from the frontend audit:
- **Finding:** "State Duplication in useDaftarSOPData"
- **Severity:** P2 (technical debt that could cause sync bugs)
- **Status:** ✅ RESOLVED

### Remaining Audit Findings
Still open (P3 severity):
1. Inconsistent query key structure
2. Missing per-route error components
3. Filter state not in URL (should use TanStack Router search params)
4. Toast configuration duplication

## Files Modified

1. `client/src/hooks/sop/useDaftarSOPData.ts` - Core refactor
2. `client/src/pages/tim-penyusun/ManajemenSOP.tsx` - Component update
3. `client/src/hooks/auth/useAppRole.ts` - Import fix
4. `client/src/components/layout/HeaderProfile.tsx` - Import fix
5. `client/src/services/*.api.ts` (10 files) - Import path fix
6. Multiple route and page files (20+) - Import path fixes

## Next Steps

1. **Short-term:** Fix pre-existing TTE hook issues (missing exports)
2. **Medium-term:** Address remaining P3 audit findings
3. **Long-term:** Consider implementing optimistic updates for bulk SOP status changes

---
*Task completed: 2026-04-02*
*Build status: Blocked by pre-existing TTE issues (unrelated to this refactor)*
