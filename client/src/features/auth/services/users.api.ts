/**
 * Users API service
 * Matches server: UserController
 */

import { apiClient, buildQueryString } from '@/utils/api-client'
import type { User, CreateUserDto, UpdateUserDto, PaginatedResponse, UsersQueryParams } from '../types/users'

export const usersApi = {
  /**
   * AUTH-05: Create new user (Biro Organisasi only)
   */
  create: (payload: CreateUserDto) =>
    apiClient.post<User>('/users', payload),

  /**
   * Get all users with pagination (Biro Organisasi only)
   */
  findAll: (params: UsersQueryParams = {}) => {
    const { page = 1, limit = 10, ...filters } = params
    const query = buildQueryString({ page, limit, ...filters })
    return apiClient.get<PaginatedResponse<User>>(`/users${query}`)
  },

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
