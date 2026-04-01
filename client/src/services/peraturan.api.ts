/**
 * Peraturan API service - Complete implementation
 * Matches server: PeraturanController
 */

import { apiClient } from './api'

export type StatusPeraturan = 'BERLAKU' | 'DICABUT'

export interface PeraturanResponse {
  id: string
  opdId: string
  namaPeraturan: string
  nomor: string
  tahun: number
  tentang: string
  status: StatusPeraturan
  createdAt: string
  updatedAt: string
  opd?: {
    id: string
    nama: string
  }
  digunakan?: number
}

export interface CreatePeraturanDto {
  opdId: string
  namaPeraturan: string
  nomor: string
  tahun: number
  tentang: string
}

export interface UpdatePeraturanDto {
  namaPeraturan?: string
  nomor?: string
  tahun?: number
  tentang?: string
}

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
    apiClient.patch<PeraturanResponse>(`/peraturan/${id}/revoke`),

  /**
   * PRT-09: Delete peraturan
   * Fails if still used as DasarHukum
   */
  delete: (id: string) =>
    apiClient.delete(`/peraturan/${id}`),
}
