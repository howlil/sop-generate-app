/**
 * Auth API service - Complete implementation
 * Matches server: AuthController
 * Note: Authentication tokens are stored in HttpOnly cookies (backend-managed)
 */

import { apiClient } from './api'
import { useAuthStore } from '@/stores/authStore'

export interface LoginRequest {
  email: string
  kataSandi: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  user: {
    id: string
    email: string
    nama: string
    peran: string
    opdId: string | null
    nip: string
    jabatan: string
    pangkat: string
    nohp: string
  }
}

export const authApi = {
  /**
   * AUTH-01: Login with email and password
   * Backend sets HttpOnly cookies for access_token and refresh_token
   */
  login: (payload: LoginRequest) =>
    apiClient.post<LoginResponse>('/login', payload),

  /**
   * AUTH: Refresh access token
   * Backend rotates cookies automatically
   */
  refresh: () =>
    apiClient.post<{ accessToken: string; refreshToken: string }>('/refresh'),

  /**
   * AUTH-06: Change password for logged-in user
   */
  changePassword: (kataSandiLama: string, kataSandiBaru: string) =>
    apiClient.patch<{ message: string }>('/change-password', { kataSandiLama, kataSandiBaru }),

  /**
   * Logout - calls server to clear HttpOnly cookies
   */
  logout: async () => {
    try {
      await apiClient.post<{ message: string }>('/logout')
    } catch {
      // Continue with local cleanup even if server call fails
    }
    useAuthStore.getState().setUser(null)
  },

  /**
   * @deprecated Token is now in HttpOnly cookie, not in store
   */
  getToken: () => null,
}
