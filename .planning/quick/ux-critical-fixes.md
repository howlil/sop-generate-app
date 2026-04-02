# Quick Task: Critical UX Fixes

**Date:** 2026-04-02  
**Priority:** CRITICAL  
**Estimated Time:** 2-3 hours

## Objective
Fix critical UX issues identified in UX audit before production deployment.

## Critical Issues to Fix

### 1. ✅ Login API Integration (CRITICAL)
**Location:** `client/src/components/auth/LoginForm.tsx`

**Current Problem:**
```typescript
// TODO: Implement actual login
setTimeout(() => {
  setIsLoading(false)
  navigate({ to: '/dashboard' })
}, 1500)
```

**Solution:**
- Use `useAuth` hook yang sudah ada
- Integrate dengan `authApi.login()`
- Handle errors properly
- Show toast notifications (sudah ada di useAuth)

### 2. ✅ Error Boundary (CRITICAL)
**Location:** New component `client/src/components/ui/ErrorBoundary.tsx`

**Solution:**
- Create React Error Boundary component
- Add fallback UI
- Log errors to console
- Provide recovery action (retry/go back)

### 3. ✅ App Loading State (CRITICAL)
**Location:** `client/src/routes/__root.tsx`

**Solution:**
- Add auth persistence check on app load
- Show loading skeleton during check
- Prevent flash of unauthenticated content

### 4. ✅ Session Management (HIGH)
**Location:** `client/src/hooks/useAuth.ts`

**Solution:**
- Add token refresh mechanism
- Add session timeout warning
- Auto-logout on token expiry

### 5. ✅ Form Validation Enhancement (HIGH)
**Location:** `client/src/components/auth/LoginForm.tsx`

**Solution:**
- Add Zod schema validation
- Real-time validation feedback
- Server error display

## Files to Create/Modify

### Create:
- `client/src/components/ui/ErrorBoundary.tsx`
- `client/src/components/ui/AppSkeleton.tsx`

### Modify:
- `client/src/components/auth/LoginForm.tsx`
- `client/src/routes/__root.tsx`
- `client/src/hooks/useAuth.ts`
- `client/src/services/auth.api.ts` (add refresh endpoint)

## Acceptance Criteria

- [ ] Login form calls actual API
- [ ] Error boundary catches crashes
- [ ] App shows loading during auth check
- [ ] Token auto-refresh every 10 minutes
- [ ] Form validation shows clear errors
- [ ] All toasts show proper feedback

## Testing

Manual testing:
1. Login dengan kredensial benar
2. Login dengan kredensial salah
3. Trigger error (disconnect network)
4. Wait for token refresh
5. Check loading state on refresh

## Rollback Plan
- Revert commits jika ada breaking changes
- Fallback ke mock login jika API gagal

---

**Status:** Pending → In Progress → Done
