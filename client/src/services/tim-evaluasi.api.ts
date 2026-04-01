/**
 * Tim Evaluasi API service - Complete implementation
 * Matches server: TimEvaluasiController
 */

import { apiClient } from './api'
import type { AnggotaTimEvaluasi, CreateTimEvaluasiDto } from '../types/tim'

export interface UpdateTimEvaluasiDto {
  status: string
  berakhirPada?: string
}

export const timEvaluasiApi = {
  /**
   * TIM-04: Get all anggota tim evaluasi
   * BIRO_ORGANISASI: see all
   * TIM_EVALUASI: see themselves
   */
  findAll: () =>
    apiClient.get<AnggotaTimEvaluasi[]>('/tim-evaluasi'),

  /**
   * TIM-04: Get anggota tim evaluasi by ID
   */
  findById: (id: string) =>
    apiClient.get<AnggotaTimEvaluasi>(`/tim-evaluasi/${id}`),

  /**
   * TIM-04: Add user to Tim Evaluasi (Biro Organisasi only)
   */
  tambah: (payload: CreateTimEvaluasiDto) =>
    apiClient.post<AnggotaTimEvaluasi>('/tim-evaluasi', payload),

  /**
   * TIM-04: Deactivate anggota (status → NONAKTIF)
   */
  nonaktifkan: (id: string) =>
    apiClient.patch<AnggotaTimEvaluasi>(`/tim-evaluasi/${id}/nonaktif`),
}
