/**
 * Users types matching server schema
 */

export interface User {
  id: string
  email: string
  nama: string
  peran: string
  opdId: string | null
  nip: string
  jabatan: string
  pangkat: string
  nohp: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  nama: string
  kataSandi: string
  peran: string
  opdId?: string
  nip: string
  jabatan: string
  pangkat: string
  nohp: string
}

export interface UpdateUserDto {
  email?: string
  nama?: string
  kataSandi?: string
  peran?: string
  opdId?: string
  nip?: string
  jabatan?: string
  pangkat?: string
  nohp?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
