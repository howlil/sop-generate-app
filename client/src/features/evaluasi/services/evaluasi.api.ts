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

  rekap: async (tahun?: number) => {
    const query = tahun ? `?tahun=${tahun}` : ''
    const response = await apiClient.get<{
      tahun: number
      totalPengajuan: number
      totalSelesai: number
      overallNilaiRataRata: number | null
      opd: Array<{
        opdId: string
        opdNama: string
        total: number
        selesai: number
        sesuai: number
        tidakSesuai: number
        nilaiRataRata: number | null
        pengajuanDetails: Array<{
          pengajuanEvaluasiId: string
          jenis: string
          status: string
          nilaiOPD: number | null
          tanggalEvaluasi: string | null
          detailSopCount: number
          hasilEvaluasi: { sesuai: number; tidakSesuai: number }
        }>
      }>
    }>(`/evaluasi/rekap${query}`)

    // Transform server response to RekapEvaluasi[] format
    if (!response || !response.opd) return []

    return response.opd.map(opd => {
      // Calculate completion rate
      const completionRate = opd.total > 0 ? Math.round((opd.selesai / opd.total) * 100) : 0

      // Transform pengajuanDetails to detail format
      const detail = opd.pengajuanDetails.map(p => ({
        pengajuanEvaluasiId: p.pengajuanEvaluasiId,
        jenis: p.jenis,
        status: p.status,
        nilaiOPD: p.nilaiOPD,
        tanggalEvaluasi: p.tanggalEvaluasi ?? '',
        detailSopCount: p.detailSopCount,
        hasilEvaluasi: p.hasilEvaluasi,
        // Computed fields for compatibility
        opdId: opd.opdId,
        opdNama: opd.opdNama,
        totalPengajuan: opd.total,
        nilaiRataRata: opd.nilaiRataRata ?? undefined,
      }))

      return {
        opdId: opd.opdId,
        opdNama: opd.opdNama,
        tahun: response.tahun,
        totalPengajuan: opd.total,
        totalTerjadwal: opd.pengajuanDetails.filter(p => p.jenis === 'TERJADWAL').length,
        totalMandiri: opd.pengajuanDetails.filter(p => p.jenis === 'MANDIRI').length,
        nilaiRataRata: opd.nilaiRataRata ?? undefined,
        completionRate,
        detail,
      }
    })
  },
}
