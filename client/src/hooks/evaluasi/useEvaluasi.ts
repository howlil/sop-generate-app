/**
 * useEvaluasi hook - TanStack Query
 * Matches server: EvaluasiService endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { evaluasiApi } from '@/services/evaluasi.api'
import { queryKeys } from '@/services/queryKeys'
import { withMutationToast } from '@/utils/handleApi'
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

// Re-export type from common
export type { StatusHasilEvaluasi } from '@/types/common'

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

// ==================== Evaluasi Hooks ====================
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
    ...withMutationToast('Pengajuan evaluasi berhasil dibuat', 'Gagal membuat pengajuan evaluasi'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
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
    ...withMutationToast('Hasil evaluasi berhasil disimpan', 'Gagal menyimpan hasil evaluasi'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
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
    ...withMutationToast('Evaluasi berhasil diselesaikan', 'Gagal menyelesaikan evaluasi'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
    },
  })
}

export function useRekapEvaluasi(tahun?: number) {
  return useQuery({
    queryKey: queryKeys.evaluasiRekap(tahun),
    queryFn: () => evaluasiApi.rekap(tahun),
    staleTime: 10 * 60 * 1000,
  })
}

// ==================== Pengajuan Evaluasi ====================
export function usePengajuanEvaluasiDetail(pengajuanId?: string) {
  const {
    data: pengajuan,
    isLoading: loading,
  } = useQuery({
    queryKey: queryKeys.evaluasiById(pengajuanId || ''),
    queryFn: () => evaluasiApi.findById(pengajuanId || ''),
    enabled: !!pengajuanId,
    staleTime: 3 * 60 * 1000,
  })

  const isVerified = pengajuan?.status === 'DIVERIFIKASI_BIRO'
  const canVerify = pengajuan?.status === 'SELESAI_DIEVALUASI'

  return {
    pengajuan: pengajuan || null,
    mergedSopRows: [],
    isVerified,
    canVerify,
    loading,
  }
}
