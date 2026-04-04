/**
 * Evaluasi API service
 * Matches server: EvaluasiController
 */

import { apiClient } from '@/utils/api-client'
import type {
  PengajuanEvaluasi,
  NilaiEvaluasi,
} from '../types/evaluasi'
import type {
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
  SelesaiEvaluasiDto,
  RekapEvaluasi,
} from '@/types/common'

export const evaluasiApi = {
  findAll: (params?: { opdId?: string; status?: string; jenis?: string }) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<PengajuanEvaluasi[]>(`/evaluasi${query}`)
  },

  findById: (id: string) =>
    apiClient.get<PengajuanEvaluasi>(`/evaluasi/${id}`),

  create: (payload: CreatePengajuanEvaluasiDto) =>
    apiClient.post<PengajuanEvaluasi>('/evaluasi', payload),

  isiNilai: (
    pengajuanEvaluasiId: string,
    sopDetailId: string,
    payload: IsiNilaiEvaluasiDto,
  ) =>
    apiClient.patch<NilaiEvaluasi>(
      `/evaluasi/${pengajuanEvaluasiId}/nilai/${sopDetailId}`,
      payload,
    ),

  selesai: (
    pengajuanEvaluasiId: string,
    payload: SelesaiEvaluasiDto,
  ) =>
    apiClient.patch<PengajuanEvaluasi>(
      `/evaluasi/${pengajuanEvaluasiId}/selesai`,
      payload,
    ),

  update: (id: string, payload: Partial<PengajuanEvaluasi>) =>
    apiClient.patch<PengajuanEvaluasi>(`/evaluasi/${id}`, payload),

  rekap: (tahun?: number) => {
    const query = tahun ? `?tahun=${tahun}` : ''
    return apiClient.get<RekapEvaluasi[]>(`/evaluasi/rekap${query}`)
  },
}
