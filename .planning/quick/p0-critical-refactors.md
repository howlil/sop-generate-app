# Quick Task: P0 Critical Refactors

**Date**: 2026-04-03  
**Priority**: P0 (Critical Technical Debt)  
**Estimated**: 2-3 hours  

## Objective

Refactor God Components identified in Principal Engineer analysis:
1. `DetailSOPPenyusun.tsx` (312 lines) → Extract hook + sub-components → ~80 lines
2. `DetailSOPProsedurEditor.tsx` (298 lines) → Extract cell components + hook → ~120 lines
3. Fix direct API calls in `DetailSOP.tsx` and `ManajemenEvaluasiSOP.tsx`

## Success Criteria

- [ ] `DetailSOPPenyusun.tsx` < 150 lines
- [ ] `DetailSOPProsedurEditor.tsx` < 150 lines
- [ ] Zero direct API calls in page components
- [ ] All functionality preserved (zero regression)
- [ ] Build passing
- [ ] Tests passing (existing tests)

## Files to Create

1. `client/src/features/sop/hooks/useDetailSOPPenyusun.ts`
2. `client/src/pages/tim-penyusun/detail-sop/DetailSOPPenyusunHeader.tsx`
3. `client/src/pages/tim-penyusun/detail-sop/DetailSOPPenyusunMain.tsx`
4. `client/src/pages/tim-penyusun/detail-sop/DetailSOPPenyusunSidePanel.tsx`
5. `client/src/pages/tim-penyusun/detail-sop/DecisionStepCell.tsx`
6. `client/src/pages/tim-penyusun/detail-sop/ImplementerCell.tsx`
7. `client/src/pages/tim-penyusun/detail-sop/TimeUnitCell.tsx`
8. `client/src/pages/tim-penyusun/detail-sop/OutputCell.tsx`
9. `client/src/pages/tim-penyusun/detail-sop/KeteranganCell.tsx`
10. `client/src/features/sop/hooks/useProsedurEditor.ts`

## Files to Update

1. `client/src/pages/tim-penyusun/DetailSOPPenyusun.tsx` (312 → ~80 lines)
2. `client/src/pages/tim-penyusun/detail-sop/DetailSOPProsedurEditor.tsx` (298 → ~120 lines)
3. `client/src/pages/kepala-opd/DetailSOP.tsx` (fix direct API call)
4. `client/src/pages/kepala-biro-organisasi/ManajemenEvaluasiSOP.tsx` (fix direct API call)

## Execution Plan

1. Extract `useDetailSOPPenyusun` hook from component logic
2. Create 3 sub-components (Header, Main, SidePanel)
3. Refactor main component to use hook + sub-components
4. Extract cell components from `DetailSOPProsedurEditor`
5. Extract `useProsedurEditor` hook
6. Refactor `DetailSOPProsedurEditor` component
7. Fix direct API calls in DetailSOP.tsx and ManajemenEvaluasiSOP.tsx
8. Test build and functionality
9. Update STATE.md
10. Commit changes

## Rollback Plan

If issues detected:
1. Revert commit
2. Restore original files from git
3. Investigate issues in isolated branch

---

*Part of UI Pattern Refactoring Plan (.planning/ui-pattern-refactor-plan.md)*
