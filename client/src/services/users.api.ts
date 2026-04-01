/**
 * Users API service
 * Matches server: UserController
 */

import { apiClient } from './api'

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

export const usersApi = {
  /**
   * AUTH-05: Create new user (Biro Organisasi only)
   */
  create: (payload: CreateUserDto) =>
    apiClient.post<User>('/users', payload),

  /**
   * Get all users with pagination (Biro Organisasi only)
   */
  findAll: (page: number = 1, limit: number = 10) =>
    apiClient.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`),

  /**
   * Get user by ID
   */
  findById: (id: string) =>
    apiClient.get<User>(`/users/${id}`),

  /**
   * Update user
   */
  update: (id: string, payload: UpdateUserDto) =>
    apiClient.patch<User>(`/users/${id}`, payload),

  /**
   * Delete user (soft-delete) (Biro Organisasi only)
   */
  delete: (id: string) =>
    apiClient.delete(`/users/${id}`),
}
