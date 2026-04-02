/**
 * OPD API service
 * Matches server: OpdController
 */

import { apiClient } from './api'
import type { OpdResponse, CreateOpdDto, UpdateOpdDto } from '@/types/opd'

export const opdApi = {
  /**
   * OPD-01/OPD-05: Get all OPD
   * BIRO_ORGANISASI: see all OPD
   * Other roles: see only their own OPD
   */
  findAll: () =>
    apiClient.get<OpdResponse[]>('/opd'),

  /**
   * OPD-05: Get OPD by ID
   */
  findById: (id: string) =>
    apiClient.get<OpdResponse>(`/opd/${id}`),

  /**
   * OPD-02: Create new OPD (Biro Organisasi only)
   */
  create: (payload: CreateOpdDto) =>
    apiClient.post<OpdResponse>('/opd', payload),

  /**
   * OPD-03: Update OPD (Biro Organisasi only)
   */
  update: (id: string, payload: UpdateOpdDto) =>
    apiClient.patch<OpdResponse>(`/opd/${id}`, payload),

  /**
   * OPD-04: Soft-delete OPD (Biro Organisasi only)
   * Validates no active pengajuan evaluasi
   */
  delete: (id: string) =>
    apiClient.delete(`/opd/${id}`),
}
