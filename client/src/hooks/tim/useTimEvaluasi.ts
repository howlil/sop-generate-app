/**
 * useTimEvaluasi hook - TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { timEvaluasiApi } from '@/services/tim-evaluasi.api'
import { queryKeys } from '@/utils/query-keys'
import { withMutationToast } from '@/utils/handleApi'
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
    ...withMutationToast('Anggota Tim Evaluasi berhasil ditambahkan', 'Gagal menambahkan anggota'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timEvaluasi })
    },
  })

  const nonaktifkanMutation = useMutation({
    mutationFn: (id: string) => timEvaluasiApi.nonaktifkan(id),
    ...withMutationToast('Anggota Tim Evaluasi dinonaktifkan', 'Gagal menonaktifkan anggota'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timEvaluasi })
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
