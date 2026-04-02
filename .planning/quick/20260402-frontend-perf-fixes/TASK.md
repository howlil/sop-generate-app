# Quick Task: Frontend Performance Fixes

**Created:** 2026-04-02  
**Priority:** P2 (Performance improvements)  
**Effort:** Low (1-2 hours)  
**Status:** In Progress

---

## Objective

Implement critical performance optimizations identified in frontend audit:

1. **Zustand Store Selector Optimization** - Prevent unnecessary re-renders
2. **GlobalToast Subscription Fix** - Reduce toast-related re-renders

---

## Tasks

### Task 1: Optimize Zustand Selectors

**Files to update:**
- `client/src/stores/authStore.ts` - Add selector examples to comments
- `client/src/hooks/auth/useAppRole.ts` - Use selectors with shallow comparison
- `client/src/components/layout/HeaderProfile.tsx` - Use selectors

**Changes:**
```typescript
// Before
const { user, logout } = useAuthStore()

// After
import { shallow } from 'zustand/shallow'
const { user, logout } = useAuthStore(
  (state) => ({ user: state.user, logout: state.logout }),
  shallow
)
```

### Task 2: Fix GlobalToast Subscription

**Files to update:**
- `client/src/components/layout/GlobalToast.tsx`
- `client/src/utils/ui.ts`

**Changes:**
```typescript
// Before
const { toast, clearToast } = useToast()

// After
const firstToast = useUIStore((state) => state.toasts[0])
const removeToast = useUIStore((state) => state.removeToast)
```

---

## Acceptance Criteria

- [ ] All components using `useAuthStore` optimized with selectors
- [ ] `GlobalToast` only re-renders when first toast changes
- [ ] No TypeScript errors
- [ ] Build passes
- [ ] No runtime errors in browser console

---

## Testing

- [ ] Login flow works correctly
- [ ] Toast notifications display and dismiss properly
- [ ] Profile menu renders without issues
- [ ] No excessive re-renders in React DevTools

---

## Notes

- Keep current `useToast()` hook for backward compatibility
- Document selector pattern in code comments for team reference
- This is a performance optimization, not a bug fix
