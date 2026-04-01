/**
 * Peraturan API service
 */

import { apiClient } from './api'
import type { Peraturan, CreatePeraturanRequest, UpdatePeraturanRequest } from '../types/peraturan'

export const peraturanApi = {
  findAll: (opdId?: string) => {
    const query = opdId ? `?opdId=${opdId}` : ''
    return apiClient.get<Peraturan[]>(`/peraturan${query}`)
  },

  findById: (id: string) => apiClient.get<Peraturan>(`/peraturan/${id}`),

  create: (payload: CreatePeraturanRequest) => 
    apiClient.post<Peraturan>('/peraturan', payload),

  update: (id: string, payload: UpdatePeraturanRequest) => 
    apiClient.patch<Peraturan>(`/peraturan/${id}`, payload),

  revoke: (id: string) => 
    apiClient.patch<Peraturan>(`/peraturan/${id}/cabut`),

  delete: (id: string) => 
    apiClient.delete(`/peraturan/${id}`),
}
