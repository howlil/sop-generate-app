/**
 * Auth types matching server schema
 */

export interface LoginRequest {
  email: string
  kataSandi: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
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
