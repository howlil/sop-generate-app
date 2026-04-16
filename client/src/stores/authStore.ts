/**
 * Auth store - Zustand
 * Store untuk auth state (user info, role)
 * Note: Token disimpan di HttpOnly cookie (backend-managed), bukan localStorage
 *
 * USAGE PATTERN: Use selectors to prevent unnecessary re-renders
 *
 * ❌ WRONG: Subscribes to entire store
 * const { user, logout } = useAuthStore()
 *
 * ✅ CORRECT: Subscribe to slice only
 * const user = useAuthStore((state) => state.user)
 * const logout = useAuthStore((state) => state.logout)
 *
 * ✅ BEST: With shallow comparison for multiple values
 * import { shallow } from 'zustand/shallow'
 * const { user, logout } = useAuthStore(
 *   (state) => ({ user: state.user, logout: state.logout }),
 *   shallow
 * )
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/features/auth/types/users";
import { ROUTES } from "@/utils/constants";

/**
 * Core user fields used in the auth store.
 * The full User type (with pangkat, nohp, createdAt, updatedAt) is defined
 * in @/features/auth/types/users.ts — import that when extra fields are needed.
 */
type AuthUser = Pick<User, "id" | "email" | "nama" | "peran" | "opdId" | "nip" | "jabatan">;

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

// ==================== Shared Hydration Helper ====================

/**
 * Ensures Zustand persist middleware has finished hydrating from localStorage.
 * Reusable across __root.tsx and role.ts to prevent duplication.
 * Uses a shared promise to avoid multiple concurrent hydration waits.
 */
let hydrationPromise: Promise<void> | null = null;

export function ensureAuthHydrated(maxWait = 2000): Promise<void> {
  // persist middleware is unavailable during SSR (no localStorage)
  if (typeof window === 'undefined') return Promise.resolve();
  if (!useAuthStore.persist) return Promise.resolve();
  if (useAuthStore.persist.hasHydrated()) return Promise.resolve();

  if (!hydrationPromise) {
    hydrationPromise = new Promise((resolve) => {
      let resolved = false;
      
      const finish = () => {
        if (!resolved) {
          resolved = true;
          hydrationPromise = null;
          resolve();
        }
      };

      const timeout = setTimeout(finish, maxWait);
      useAuthStore.persist.onFinishHydration(() => {
        clearTimeout(timeout);
        finish();
      });
    });
  }

  return hydrationPromise;
}

/**
 * Get the current user's role string.
 * Returns undefined if no user is authenticated.
 */
export function getRole(): string | undefined {
  return useAuthStore.getState().user?.peran;
}

/**
 * Route guard: redirect if user doesn't have one of the required roles.
 * Usage in route file: beforeLoad: requireRoles(['BIRO_ORGANISASI'])
 */
export function requireRoles(roles: string[]) {
  return async () => {
    // Skip during SSR — no localStorage available
    if (typeof window === "undefined") return;

    await ensureAuthHydrated();
    const user = useAuthStore.getState().user;
    if (!user || !roles.includes(user.peran)) {
      const { redirect } = await import("@tanstack/react-router");
      throw redirect({ to: ROUTES.HOME });
    }
  };
}
