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
import { apiClient } from "@/lib/api/api-client";
import type { LoginApiResponse, PublicPenggunaLoginData } from "@/types/dto/auth.dto";
import type { User } from "@/types/dto/users.dto";
import { ROUTES } from "@/utils/constants";
import { toNavigationRole } from "@/utils/role-key";

/**
 * Core user fields used in the auth store.
 * The full User type (with pangkat, nohp, createdAt, updatedAt) is defined
 * in @/types/dto/users.dto.ts — import that when extra fields are needed.
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

function mapPublicDataToAuthUser(u: PublicPenggunaLoginData): AuthUser {
  return {
    id: u.penggunaId,
    email: u.email,
    nama: u.nama,
    peran: u.peran,
    opdId: u.opdId,
    nip: u.nip,
    jabatan: u.jabatan,
  };
}

/**
 * Mengisi store dari cookie sesi (GET /auth/me + credentials).
 * Dipakai setelah refresh: cookie HttpOnly tidak bisa dibaca JS; tanpa ini guard hanya melihat localStorage.
 */
export async function syncAuthFromCookie(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const res = await apiClient.get<LoginApiResponse>("/auth/me");
    useAuthStore.getState().setUser(mapPublicDataToAuthUser(res.data));
    return true;
  } catch {
    return false;
  }
}

export async function ensureAuthHydrated(maxWait = 2000): Promise<void> {
  // persist middleware is unavailable during SSR (no localStorage)
  if (typeof window === 'undefined') return;
  if (!useAuthStore.persist) return;
  if (useAuthStore.persist.hasHydrated()) return;

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

  await hydrationPromise;
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
 * Usage in route file: beforeLoad: requireRoles(['PJ_EVALUATOR'])
 */
export function requireRoles(roles: string[]) {
  return async () => {
    // Skip during SSR — no localStorage available
    if (typeof window === "undefined") return;

    await ensureAuthHydrated();
    const user = useAuthStore.getState().user;
    const navRole = user ? toNavigationRole(user.peran) : undefined;
    if (!user || navRole === undefined || !roles.includes(navRole)) {
      const { redirect } = await import("@tanstack/react-router");
      throw redirect({ to: ROUTES.HOME });
    }
  };
}
