/**
 * Evaluasi API service
 * Matches server: EvaluasiController
 */

import { apiClient } from './api'
import type {
  PengajuanEvaluasi,
  NilaiEvaluasi,
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
  SelesaiEvaluasiDto,
  RekapEvaluasi,
} from '../types/evaluasi'

export const evaluasiApi = {
  /**
   * EVL-04: Get all pengajuan evaluasi (open pool for TIM_EVALUASI)
   */
  findAll: (params?: {
    opdId?: string
    status?: string
    jenis?: string
  }) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<PengajuanEvaluasi[]>(`/evaluasi${query}`)
  },

  /**
   * EVL-08: Get pengajuan evaluasi by ID with nilai evaluasi
   */
  findById: (id: string) =>
    apiClient.get<PengajuanEvaluasi>(`/evaluasi/${id}`),

  /**
   * EVL-01: Create new pengajuan evaluasi (Biro Organisasi only)
   */
  create: (payload: CreatePengajuanEvaluasiDto) =>
    apiClient.post<PengajuanEvaluasi>('/evaluasi', payload),

  /**
   * EVL-05: Fill evaluation result for a DetailSOP (TIM_EVALUASI only)
   * Includes optimistic locking via version field
   */
  isiNilai: (
    pengajuanEvaluasiId: string,
    sopDetailId: string,
    payload: IsiNilaiEvaluasiDto,
  ) =>
    apiClient.patch<NilaiEvaluasi>(
      `/evaluasi/${pengajuanEvaluasiId}/nilai/${sopDetailId}`,
      payload,
    ),

  /**
   * EVL-06/07: Complete evaluation (TIM_EVALUASI only)
   * For TERJADWAL: nilaiOPD is required
   * For MANDIRI: nilaiOPD must be null
   */
  selesai: (
    pengajuanEvaluasiId: string,
    payload: SelesaiEvaluasiDto,
  ) =>
    apiClient.patch<PengajuanEvaluasi>(
      `/evaluasi/${pengajuanEvaluasiId}/selesai`,
      payload,
    ),

  /**
   * EVL-09: Get annual recap per OPD (Biro Organisasi only)
   */
  rekap: (tahun?: number) => {
    const query = tahun ? `?tahun=${tahun}` : ''
    return apiClient.get<RekapEvaluasi[]>(`/evaluasi/rekap${query}`)
  },
}
