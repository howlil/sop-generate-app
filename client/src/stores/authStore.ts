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
 *
 * 📝 ESLINT TODO: Add eslint-plugin-zustand with useShallow rule when ESLint is configured for client
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  nama: string
  peran: string
  opdId: string | null
  nip: string
  jabatan: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      logout: () => {
        set({ user: null, isAuthenticated: false })
        // Token cookies akan di-clear oleh backend saat logout API call
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)

// Convenience getter for route guards
export function getRole() {
  return useAuthStore.getState().user
}
