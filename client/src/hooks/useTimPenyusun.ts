/**
 * useTimPenyusun hook - TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { timPenyusunApi } from '@/services/tim-penyusun.api'
import { queryKeys } from '@/services/queryKeys'
import { showToast } from '@/stores/uiStore'
import type { CreateTimPenyusunRequest } from '@/types/tim'

const TIM_PENYUSUN_STALE_TIME = 5 * 60 * 1000 // 5 minutes

export function useTimPenyusun(opdId?: string) {
  const queryClient = useQueryClient()

  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.timPenyusunList(opdId),
    queryFn: () => timPenyusunApi.findAll(opdId ? { opdId } : undefined),
    staleTime: TIM_PENYUSUN_STALE_TIME,
  })

  const tambahMutation = useMutation({
    mutationFn: (payload: CreateTimPenyusunRequest) => timPenyusunApi.tambah(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timPenyusun })
      showToast('Anggota Tim Penyusun berhasil ditambahkan', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menambahkan anggota', 'error')
    },
  })

  const nonaktifkanMutation = useMutation({
    mutationFn: (id: string) => timPenyusunApi.nonaktifkan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timPenyusun })
      showToast('Anggota Tim Penyusun dinonaktifkan', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menonaktifkan anggota', 'error')
    },
  })

  const pindahMutation = useMutation({
    mutationFn: ({ id, opdId }: { id: string; opdId: string }) =>
      timPenyusunApi.pindah(id, { opdId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timPenyusun })
      showToast('Anggota Tim Penyusun dipindah', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal memindah anggota', 'error')
    },
  })

  return {
    list,
    isLoading,
    error,
    tambah: tambahMutation.mutateAsync,
    nonaktifkan: nonaktifkanMutation.mutateAsync,
    pindah: pindahMutation.mutateAsync,
    isAdding: tambahMutation.isPending,
    isNonaktifkan: nonaktifkanMutation.isPending,
    isPindah: pindahMutation.isPending,
  }
}
