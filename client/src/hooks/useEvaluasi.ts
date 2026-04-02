/**
 * useEvaluasi hook - TanStack Query
 * Matches server: EvaluasiService endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { evaluasiApi } from '@/services/evaluasi.api'
import { queryKeys } from '@/services/queryKeys'
import { showToast } from '@/stores/uiStore'
import type {
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
  SelesaiEvaluasiDto,
} from '@/types/evaluasi'

const EVALUASI_STALE_TIME = 3 * 60 * 1000 // 3 minutes

// ==================== Evaluasi Domain Logic ====================
export const STATUS_HASIL_EVALUASI = {
  SESUAI: 'SESUAI',
  TIDAK_SESUAI: 'TIDAK_SESUAI',
} as const

export type StatusHasilEvaluasi = typeof STATUS_HASIL_EVALUASI[keyof typeof STATUS_HASIL_EVALUASI]

export interface StatusHasilEvaluasiForm {
  hasil: StatusHasilEvaluasi
  catatan: string
}

export function getStatusSopAfterEvaluasi(hasil: StatusHasilEvaluasi): string {
  if (hasil === 'SESUAI') {
    return 'SIAP_DIVERIFIKASI'
  }
  return 'REVISI_DARI_TIM_EVALUASI'
}

export function isFormEvaluasiSopComplete(form: StatusHasilEvaluasiForm): boolean {
  return !!form.hasil && form.hasil !== ''
}

// ==================== Stub Functions (for backward compatibility) ====================
export interface RiwayatEvaluasiSOPItem {
  sopId: string
  judul: string
  tanggal: string
  hasil: string
}

export interface RiwayatEvaluasiOPDItem {
  opdId: string
  opdNama: string
  tanggal: string
  hasil: string
}

export function getRiwayatEvaluasiSop(): RiwayatEvaluasiSOPItem[] {
  return []
}

export function getRiwayatEvaluasiOpd(): RiwayatEvaluasiOPDItem[] {
  return []
}

export function getLastEvaluatedByInitial(): Record<string, { evaluatorName: string; date: string }> {
  return {}
}

export interface DetailOpdPerTahun {
  opdId: string
  opdNama: string
  tahun: number
  jumlahSop: number
  skor: number
}

export function getDataGrafikEvaluasiTahunan(_tahun: number): DetailOpdPerTahun[] {
  return []
}

export function getDetailOpdPerTahun(_tahun: number, _opdId: string): DetailOpdPerTahun | null {
  return null
}

export function useEvaluasi(params?: { opdId?: string; status?: string; jenis?: string }) {
  const queryClient = useQueryClient()

  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.evaluasiList(params),
    queryFn: () => evaluasiApi.findAll(params),
    staleTime: EVALUASI_STALE_TIME,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreatePengajuanEvaluasiDto) => evaluasiApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
      showToast('Pengajuan evaluasi berhasil dibuat', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal membuat pengajuan evaluasi', 'error')
    },
  })

  return {
    list,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}

export function useEvaluasiDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.evaluasiById(id),
    queryFn: () => evaluasiApi.findById(id),
    enabled: !!id,
    staleTime: EVALUASI_STALE_TIME,
  })
}

export function useIsiNilaiEvaluasi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pengajuanEvaluasiId,
      sopDetailId,
      payload,
    }: {
      pengajuanEvaluasiId: string
      sopDetailId: string
      payload: IsiNilaiEvaluasiDto
    }) => evaluasiApi.isiNilai(pengajuanEvaluasiId, sopDetailId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
      showToast('Hasil evaluasi berhasil disimpan', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menyimpan hasil evaluasi', 'error')
    },
  })
}

export function useSelesaiEvaluasi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pengajuanEvaluasiId,
      payload,
    }: {
      pengajuanEvaluasiId: string
      payload: SelesaiEvaluasiDto
    }) => evaluasiApi.selesai(pengajuanEvaluasiId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
      showToast('Evaluasi berhasil diselesaikan', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menyelesaikan evaluasi', 'error')
    },
  })
}

export function useRekapEvaluasi(tahun?: number) {
  return useQuery({
    queryKey: queryKeys.evaluasiRekap(tahun),
    queryFn: () => evaluasiApi.rekap(tahun),
    staleTime: 10 * 60 * 1000, // 10 minutes for recap data
  })
}
