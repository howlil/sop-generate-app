/**
 * OPD API service
 */

import { apiClient } from './api'
import type { Opd, CreateOpdRequest, UpdateOpdRequest } from '../types/opd'

export const opdApi = {
  findAll: () => apiClient.get<Opd[]>('/opd'),

  findById: (id: string) => apiClient.get<Opd>(`/opd/${id}`),

  create: (payload: CreateOpdRequest) => 
    apiClient.post<Opd>('/opd', payload),

  update: (id: string, payload: UpdateOpdRequest) => 
    apiClient.patch<Opd>(`/opd/${id}`, payload),

  delete: (id: string) => 
    apiClient.delete(`/opd/${id}`),
}
