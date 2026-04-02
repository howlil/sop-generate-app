/**
 * useTimPenyusun hook - TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { timPenyusunApi } from '@/features/tim'
import { queryKeys } from '@/utils/query-keys'
import { withMutationToast } from '@/utils/handleApi'
import type { CreateTimPenyusunRequest } from '@/features/tim'

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
    ...withMutationToast('Anggota Tim Penyusun berhasil ditambahkan', 'Gagal menambahkan anggota'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timPenyusun })
    },
  })

  const nonaktifkanMutation = useMutation({
    mutationFn: (id: string) => timPenyusunApi.nonaktifkan(id),
    ...withMutationToast('Anggota Tim Penyusun dinonaktifkan', 'Gagal menonaktifkan anggota'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timPenyusun })
    },
  })

  const pindahMutation = useMutation({
    mutationFn: ({ id, opdId }: { id: string; opdId: string }) =>
      timPenyusunApi.pindah(id, { opdId }),
    ...withMutationToast('Anggota Tim Penyusun dipindah', 'Gagal memindah anggota'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timPenyusun })
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
