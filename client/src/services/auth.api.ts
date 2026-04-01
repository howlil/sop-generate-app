/**
 * Auth API service - Complete implementation
 * Matches server: AuthController
 */

import { apiClient } from './api'

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

export interface ChangePasswordRequest {
  kataSandiLama: string
  kataSandiBaru: string
}

export const authApi = {
  /**
   * AUTH-01: Login with email and password
   * Returns JWT token with userId, role, and opdId
   */
  login: (payload: LoginRequest) =>
    apiClient.post<LoginResponse>('/login', payload),

  /**
   * AUTH-06: Change password for logged-in user
   */
  changePassword: (payload: ChangePasswordRequest) =>
    apiClient.patch<{ message: string }>('/change-password', payload),

  /**
   * Logout (client-side only - clears token)
   */
  logout: () => {
    apiClient.clearToken()
  },

  /**
   * Get current auth token
   */
  getToken: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('biro-organisasi-token')
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!authApi.getToken()
  },

  /**
   * Set auth token (used after login)
   */
  setToken: (token: string) => {
    apiClient.setToken(token)
  },
}
