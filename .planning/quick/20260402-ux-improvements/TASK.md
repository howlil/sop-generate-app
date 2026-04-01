# Quick Task: UX Improvements - Critical & High Priority Fixes

**Date:** 2026-04-02
**Source:** UX Audit Report (`docs/UX-AUDIT-REPORT.md`)
**Priority:** Critical + High
**Status:** ✅ COMPLETE
**Commit:** ca8e15b

## Objectives

Fix accessibility and UX issues that block production readiness:

### Critical (Must Fix Before Production)
1. ✅ Increase touch target sizes to 44px minimum
2. ✅ Associate error messages with inputs via aria-describedby

### High Priority (Should Fix in 1-2 weeks)
3. ✅ Fix color contrast (gray-400 → gray-500)
4. ✅ Increase base font size (12px → 14px)
5. ✅ Add skip-to-main-content link
6. ✅ Add aria-live regions for toast notifications
7. ✅ Fix table accessibility (scope="col")
8. ✅ Add aria-hidden to decorative icons

## Scope

**Files to modify:**
- `client/src/components/ui/button.tsx`
- `client/src/components/ui/input.tsx`
- `client/src/components/ui/data-table.tsx`
- `client/src/components/auth/LoginForm.tsx`
- `client/src/components/layout/RoleLayout.tsx`
- `client/src/stores/uiStore.ts`
- `client/src/styles.css`

**Out of scope:**
- Medium/Low priority fixes (separate task)
- Usability testing execution
- Dark mode implementation

## Acceptance Criteria

- [x] All buttons ≥ 44px height
- [x] All icon buttons ≥ 44px × 44px
- [x] All inputs ≥ 44px height
- [x] Error messages linked to inputs with aria-describedby
- [x] Color contrast ≥ 4.5:1 for body text
- [x] Base font size ≥ 14px
- [x] Skip-to-main-content link present and functional
- [x] Toast notifications use aria-live
- [x] Table headers have scope="col"
- [x] Decorative icons have aria-hidden

## Definition of Done

- [x] All changes committed atomically
- [x] STATE.md updated
- [ ] No TypeScript errors (blocked by pre-existing missing file)
- [x] No breaking changes to existing functionality
