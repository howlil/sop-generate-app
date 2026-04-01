/**
 * Tim Penyusun API service
 */

import { apiClient } from './api'
import type { AnggotaTimPenyusun, CreateTimPenyusunRequest } from '../types/tim'

export const timPenyusunApi = {
  findAll: (opdId?: string) => {
    const query = opdId ? `?opdId=${opdId}` : ''
    return apiClient.get<AnggotaTimPenyusun[]>(`/tim-penyusun${query}`)
  },

  findById: (id: string) => apiClient.get<AnggotaTimPenyusun>(`/tim-penyusun/${id}`),

  tambah: (payload: CreateTimPenyusunRequest) => 
    apiClient.post<AnggotaTimPenyusun>('/tim-penyusun', payload),

  nonaktifkan: (id: string) => 
    apiClient.patch<AnggotaTimPenyusun>(`/tim-penyusun/${id}/nonaktifkan`),

  pindah: (id: string, opdId: string) => 
    apiClient.patch<AnggotaTimPenyusun>(`/tim-penyusun/${id}/pindah`, { opdId }),
}
