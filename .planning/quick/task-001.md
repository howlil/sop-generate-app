# Quick Task 001: Fix Role Guard Security Gap

## Objective
Implement authentication guard and fix role guard redirect logic to prevent unauthorized access to protected routes.

## Tasks
1. Create `utils/auth-guard.ts` with `requireAuthBeforeLoad()` function
2. Update `utils/role-route-guard.ts` to check auth first, then role
3. Add global auth check to `routes/__root.tsx`
4. Update import paths in all role route files

## Acceptance Criteria
- [ ] Unauthenticated users redirect to `/auth/login` (not `/`)
- [ ] Authenticated users with wrong role redirect to `/` with denied message
- [ ] All role routes use consistent import paths from `@/utils/`
- [ ] Global auth check prevents forgetting guards on new routes

## Files to Change
- `client/src/utils/auth-guard.ts` (NEW)
- `client/src/utils/role-route-guard.ts` (UPDATE)
- `client/src/routes/__root.tsx` (UPDATE)
- `client/src/routes/biro-organisasi.tsx` (UPDATE import)
- `client/src/routes/kepala-opd.tsx` (UPDATE import)
- `client/src/routes/tim-evaluasi.tsx` (UPDATE import)
- `client/src/routes/tim-penyusun.tsx` (UPDATE import)
