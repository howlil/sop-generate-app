/**
 * Auth store - Zustand
 * Store untuk auth state (token, user info, role)
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
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => {
        if (token) {
          localStorage.setItem('biro-organisasi-token', token)
        } else {
          localStorage.removeItem('biro-organisasi-token')
        }
        set({ token })
      },
      
      logout: () => {
        localStorage.removeItem('biro-organisasi-token')
        set({ user: null, token: null, isAuthenticated: false })
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
