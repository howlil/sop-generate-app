/**
 * Auth API service
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
  }
}

export const authApi = {
  login: (payload: LoginRequest) => 
    apiClient.post<LoginResponse>('/login', payload),

  changePassword: (kataSandiLama: string, kataSandiBaru: string) => 
    apiClient.patch<{ message: string }>('/change-password', { kataSandiLama, kataSandiBaru }),
}
