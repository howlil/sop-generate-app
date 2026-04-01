/**
 * Tim Penyusun API service - Complete implementation
 * Matches server: TimPenyusunController
 */

import { apiClient } from './api'
import type { AnggotaTimPenyusun, CreateTimPenyusunDto, PindahTimPenyusunDto } from '../types/tim'

export const timPenyusunApi = {
  /**
   * TIM-01/TIM-05: Get all anggota tim penyusun
   * BIRO_ORGANISASI: see all
   * Other roles: see only their own OPD
   */
  findAll: (params?: { opdId?: string }) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<AnggotaTimPenyusun[]>(`/tim-penyusun${query}`)
  },

  /**
   * TIM-05: Get anggota tim penyusun by ID
   */
  findById: (id: string) =>
    apiClient.get<AnggotaTimPenyusun>(`/tim-penyusun/${id}`),

  /**
   * TIM-01: Add user to Tim Penyusun (Biro Organisasi only)
   */
  tambah: (payload: CreateTimPenyusunDto) =>
    apiClient.post<AnggotaTimPenyusun>('/tim-penyusun', payload),

  /**
   * TIM-02: Deactivate anggota (status → NONAKTIF)
   */
  nonaktifkan: (id: string) =>
    apiClient.patch<AnggotaTimPenyusun>(`/tim-penyusun/${id}/nonaktif`),

  /**
   * TIM-03: Transfer anggota to different OPD
   */
  pindah: (id: string, payload: PindahTimPenyusunDto) =>
    apiClient.patch<AnggotaTimPenyusun>(`/tim-penyusun/${id}/pindah`, payload),
}
