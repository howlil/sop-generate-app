/**
 * SOP API service
 */

import { apiClient } from './api'
import type { Sop, SopDetail, CreateSopRequest } from '../types/sop'

export const sopApi = {
  findAll: (params?: { opdId?: string; status?: string }) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<Sop[]>(`/sop${query}`)
  },

  findById: (id: string) => apiClient.get<SopDetail>(`/sop/${id}`),

  create: (payload: CreateSopRequest) => 
    apiClient.post<Sop>('/sop', payload),

  update: (id: string, judul: string) => 
    apiClient.patch<Sop>(`/sop/${id}`, { judul }),

  delete: (id: string) => 
    apiClient.delete(`/sop/${id}`),
}
