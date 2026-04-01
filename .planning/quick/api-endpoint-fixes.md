# Quick Task: Fix API Endpoint Mismatches

**Created:** 2026-04-02
**Priority:** P0 - Critical (breaking changes)

## Task Description

Fix all API endpoint mismatches between client and server identified in FE API Contract Analysis.

## Fixes Required

### P0 - Critical (Breaking)
1. **TTE endpoints** - 4 path mismatches that will cause 404 errors
2. **Tim nonaktifkan endpoints** - 2 path mismatches
3. **Peraturan revoke endpoint** - 1 path mismatch

### P1 - High
4. **Langkah SOP endpoints** - Update to nested routes (3 endpoints)
5. **Swimlane GET endpoint** - Add missing endpoint

### P2 - Medium
6. **Auth refresh endpoint** - Add unused endpoint

## Files to Modify

- `client/src/services/tte.api.ts`
- `client/src/services/tim-penyusun.api.ts`
- `client/src/services/tim-evaluasi.api.ts`
- `client/src/services/peraturan.api.ts`
- `client/src/services/sop.api.ts`
- `client/src/services/auth.api.ts`

## Acceptance Criteria

- [ ] All endpoint paths match server exactly
- [ ] TypeScript types are correct
- [ ] No breaking changes to existing hook usage
- [ ] All fixes committed atomically
