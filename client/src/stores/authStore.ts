/**
 * Auth store - Zustand
 * Store untuk auth state (user info, role)
 * Note: Token disimpan di HttpOnly cookie (backend-managed), bukan localStorage
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

// Selectors
export const selectUser = (state: AuthState) => state.user
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated
export const selectRole = (state: AuthState) => state.user?.peran

// Convenience getter for route guards
export function getRole() {
  return useAuthStore.getState().user
}
