# Quick Task: Code Review P0 Critical Fixes

**Date:** 2026-04-03
**Priority:** P0 - Critical fixes from code review
**Effort:** 2-3 hours

---

## Task Description

Fix critical issues identified in frontend code review that could cause production problems:

1. **Missing Error Boundaries on Routes** - Prevents blank screens
2. **No Query Error Retry Configuration** - Proper error handling for 4xx vs 5xx errors
3. **Missing Loading States** - Better UX for async operations

---

## Files to Update

### 1. Query Configuration (P0)
- `client/src/config/query.config.ts` - Add retry logic for 4xx/5xx differentiation

### 2. Route Error Boundaries (P0)
- Update all route files in `client/src/routes/` to add `errorComponent` and `pendingComponent`
- Key routes:
  - `tim-penyusun/manajemen-sop.tsx`
  - `tim-penyusun/daftar-sop.tsx` (already redirects)
  - `tim-evaluasi/evaluasi.tsx`
  - `biro-organisasi/manajemen-evaluasi-sop.tsx`
  - `kepala-opd/pantau-sop.tsx`

### 3. Loading States (P1)
- `client/src/pages/tim-penyusun/ManajemenSop.tsx` - Add loading state
- Create reusable `Table.Skeleton` component if not exists

---

## Acceptance Criteria

- [ ] Query retry logic differentiates 4xx vs 5xx errors
- [ ] All main routes have errorComponent and pendingComponent
- [ ] ManajemenSOP page shows loading skeleton during data fetch
- [ ] Build passes without errors
- [ ] No console warnings

---

## Execution Notes

- Use existing `ErrorBoundary` and `AppSkeleton` components
- Keep changes minimal and focused
- Test build after each change
- Commit atomically per fix

---

## Related

- Code review report: Generated from comprehensive frontend audit
- Skill references: `.skills/frontend-codereview.md`, `.skills/fe-builder.md`
