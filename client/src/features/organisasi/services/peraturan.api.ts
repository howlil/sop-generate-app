/**
 * Peraturan API service
 * Matches server: PeraturanController
 */

import { apiClient, buildQueryString } from '@/utils/api-client'
import type { PeraturanResponse, CreatePeraturanDto, UpdatePeraturanDto } from '../types/peraturan'

export const peraturanApi = {
  /**
   * PRT-01: Get all peraturan
   * Filter by OPD for non-BIRO roles
   */
  findAll: (params?: { opdId?: string }) =>
    apiClient.get<PeraturanResponse[]>(`/peraturan${buildQueryString(params)}`),

  /**
   * PRT-06: Get peraturan by ID
   */
  findById: (id: string) =>
    apiClient.get<PeraturanResponse>(`/peraturan/${id}`),

  /**
   * PRT-02: Create new peraturan (Tim Penyusun / Koordinator Tim Penyusun)
   */
  create: (payload: CreatePeraturanDto) =>
    apiClient.post<PeraturanResponse>('/peraturan', payload),

  /**
   * PRT-03: Update peraturan
   */
  update: (id: string, payload: UpdatePeraturanDto) =>
    apiClient.patch<PeraturanResponse>(`/peraturan/${id}`, payload),

  /**
   * PRT-09: Delete peraturan
   * Fails if still used as DasarHukum
   */
  delete: (id: string) =>
    apiClient.delete(`/peraturan/${id}`),
}
