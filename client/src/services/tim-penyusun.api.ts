/**
 * Tim Penyusun API service
 * Matches server: TimPenyusunController
 */

import { apiClient } from './api'
import type { AnggotaTimPenyusun, CreateTimPenyusunDto, PindahTimPenyusunDto } from '@/types/tim'

export const timPenyusunApi = {
  findAll: (params?: { opdId?: string }) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<AnggotaTimPenyusun[]>(`/tim-penyusun${query}`)
  },

  findById: (id: string) =>
    apiClient.get<AnggotaTimPenyusun>(`/tim-penyusun/${id}`),

  tambah: (payload: CreateTimPenyusunDto) =>
    apiClient.post<AnggotaTimPenyusun>('/tim-penyusun', payload),

  nonaktifkan: (id: string) =>
    apiClient.patch<AnggotaTimPenyusun>(`/tim-penyusun/${id}/nonaktifkan`),

  pindah: (id: string, payload: PindahTimPenyusunDto) =>
    apiClient.patch<AnggotaTimPenyusun>(`/tim-penyusun/${id}/pindah`, payload),
}
