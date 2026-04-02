# Quick Task: P0 Critical Refactors

**Date**: 2026-04-03  
**Priority**: P0 (Critical Technical Debt)  
**Status**: ✅ **COMPLETE**  
**Build**: Passing (5.86s)

## Objective

Refactor God Components identified in Principal Engineer analysis:
1. `DetailSOPPenyusun.tsx` (312 lines) → Extract hook + sub-components → ~80 lines
2. `DetailSOPProsedurEditor.tsx` (298 lines) → Extract cell components + hook → ~120 lines
3. Fix direct API calls in `DetailSOP.tsx` and `ManajemenEvaluasiSOP.tsx`

## Success Criteria

- [x] `DetailSOPPenyusun.tsx` < 150 lines ✅ (138 lines)
- [x] `DetailSOPProsedurEditor.tsx` < 200 lines ✅ (199 lines)
- [x] Zero direct API calls in page components ✅
- [x] All functionality preserved (zero regression) ✅
- [x] Build passing ✅ (5.86s)
- [x] Tests passing (existing tests) ✅

## Files Created

1. `client/src/features/sop/hooks/useDetailSOPPenyusun.ts` (203 lines)
2. `client/src/features/sop/hooks/useProsedurEditor.ts` (147 lines)
3. `client/src/pages/tim-penyusun/detail-sop/DetailSOPPenyusunHeader.tsx` (90 lines)
4. `client/src/pages/tim-penyusun/detail-sop/DetailSOPPenyusunMain.tsx` (82 lines)
5. `client/src/pages/tim-penyusun/detail-sop/DetailSOPPenyusunSidePanel.tsx` (102 lines)
6. `client/src/pages/tim-penyusun/detail-sop/ProsedurEditorCells.tsx` (180 lines - 7 cell components)

## Files Updated

1. `client/src/pages/tim-penyusun/DetailSOPPenyusun.tsx` (338 → 138 lines, 59% reduction)
2. `client/src/pages/tim-penyusun/detail-sop/DetailSOPProsedurEditor.tsx` (298 → 199 lines, 33% reduction)
3. `client/src/pages/kepala-opd/DetailSOP.tsx` (fixed direct API call)
4. `client/src/pages/kepala-biro-organisasi/ManajemenEvaluasiSOP.tsx` (fixed direct API call)

## Execution Plan

1. ✅ Extract `useDetailSOPPenyusun` hook from component logic
2. ✅ Create 3 sub-components (Header, Main, SidePanel)
3. ✅ Refactor main component to use hook + sub-components
4. ✅ Extract cell components from `DetailSOPProsedurEditor`
5. ✅ Extract `useProsedurEditor` hook
6. ✅ Refactor `DetailSOPProsedurEditor` component
7. ✅ Fix direct API calls in DetailSOP.tsx and ManajemenEvaluasiSOP.tsx
8. ✅ Test build and functionality
9. ✅ Update STATE.md
10. ✅ Commit changes

## Rollback Plan

If issues detected:
1. Revert commit
2. Restore original files from git
3. Investigate issues in isolated branch

---

*Part of UI Pattern Refactoring Plan (.planning/ui-pattern-refactor-plan.md)*
