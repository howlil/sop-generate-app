/**
 * useTimEvaluasi hook - TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { timEvaluasiApi } from '@/services/tim-evaluasi.api'
import { queryKeys } from '@/services/queryKeys'
import { showToast } from '@/stores/uiStore'
import type { CreateTimEvaluasiRequest } from '@/types/tim'

const TIM_EVALUASI_STALE_TIME = 5 * 60 * 1000 // 5 minutes

export function useTimEvaluasi() {
  const queryClient = useQueryClient()

  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.timEvaluasiList(),
    queryFn: () => timEvaluasiApi.findAll(),
    staleTime: TIM_EVALUASI_STALE_TIME,
  })

  const tambahMutation = useMutation({
    mutationFn: (payload: CreateTimEvaluasiRequest) => timEvaluasiApi.tambah(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timEvaluasi })
      showToast('Anggota Tim Evaluasi berhasil ditambahkan', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menambahkan anggota', 'error')
    },
  })

  const nonaktifkanMutation = useMutation({
    mutationFn: (id: string) => timEvaluasiApi.nonaktifkan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timEvaluasi })
      showToast('Anggota Tim Evaluasi dinonaktifkan', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menonaktifkan anggota', 'error')
    },
  })

  return {
    list,
    isLoading,
    error,
    tambah: tambahMutation.mutateAsync,
    nonaktifkan: nonaktifkanMutation.mutateAsync,
    isAdding: tambahMutation.isPending,
    isNonaktifkan: nonaktifkanMutation.isPending,
  }
}
