/**
 * Tim Penyusun API service
 * Matches server: TimPenyusunController
 */

import { apiClient, buildQueryString } from '@/utils/api-client'
import type { AnggotaTimPenyusun, CreateTimPenyusunDto, PindahTimPenyusunDto } from '../types/tim'

export interface TimPenyusunQueryParams {
  opdId?: string
  page?: number
  limit?: number
}

export interface PaginatedTimPenyusunResponse {
  data: AnggotaTimPenyusun[]
  total: number
  page: number
  limit: number
}

export const timPenyusunApi = {
  findAll: (params: TimPenyusunQueryParams = {}) => {
    const { page = 1, limit = 20, ...filters } = params
    const query = buildQueryString({ page, limit, ...filters })
    return apiClient.get<PaginatedTimPenyusunResponse>(`/tim-penyusun${query}`)
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
