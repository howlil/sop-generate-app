/**
 * Auth API service
 * Matches server: AuthController
 * Note: Authentication tokens are stored in HttpOnly cookies (backend-managed)
 */

import { apiClient } from '../utils/api-client'
import type { LoginRequest, LoginResponse } from '@/types/auth'

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
    // Note: Token cleanup is handled by backend (HttpOnly cookies)
  },
}
