/**
 * Peraturan API service
 * Matches server: PeraturanController
 */

import { apiClient } from '@/utils/api-client'
import type { PeraturanResponse, CreatePeraturanDto, UpdatePeraturanDto } from '../types/peraturan'
import type { StatusPeraturan } from '@/types/common'

export const peraturanApi = {
  /**
   * PRT-01: Get all peraturan
   * Filter by OPD for non-BIRO roles
   */
  findAll: (params?: { opdId?: string }) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<PeraturanResponse[]>(`/peraturan${query}`)
  },

  /**
   * PRT-06: Get peraturan by ID
   */
  findById: (id: string) =>
    apiClient.get<PeraturanResponse>(`/peraturan/${id}`),

  /**
   * PRT-02: Create new peraturan (Biro Organisasi only)
   */
  create: (payload: CreatePeraturanDto) =>
    apiClient.post<PeraturanResponse>('/peraturan', payload),

  /**
   * PRT-03: Update peraturan (auto-increment version)
   */
  update: (id: string, payload: UpdatePeraturanDto) =>
    apiClient.patch<PeraturanResponse>(`/peraturan/${id}`, payload),

  /**
   * PRT-04: Revoke peraturan (status → DICABUT)
   */
  revoke: (id: string) =>
    apiClient.patch<PeraturanResponse>(`/peraturan/${id}/cabut`),

  /**
   * PRT-09: Delete peraturan
   * Fails if still used as DasarHukum
   */
  delete: (id: string) =>
    apiClient.delete(`/peraturan/${id}`),
}
