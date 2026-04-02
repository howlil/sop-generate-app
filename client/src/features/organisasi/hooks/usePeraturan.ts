/**
 * usePeraturan hook - TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { peraturanApi } from '@/features/organisasi'
import { queryKeys } from '@/utils/query-keys'
import { withMutationToast } from '@/utils/handleApi'
import type { CreatePeraturanRequest, UpdatePeraturanRequest } from '@/features/organisasi'

const PERATURAN_STALE_TIME = 5 * 60 * 1000 // 5 minutes

export function usePeraturan(opdId?: string) {
  const queryClient = useQueryClient()

  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.peraturanList(opdId),
    queryFn: () => peraturanApi.findAll(opdId ? { opdId } : undefined),
    staleTime: PERATURAN_STALE_TIME,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreatePeraturanRequest) => peraturanApi.create(payload),
    ...withMutationToast('Peraturan berhasil ditambahkan', 'Gagal menambahkan peraturan'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.peraturan })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePeraturanRequest }) =>
      peraturanApi.update(id, payload),
    ...withMutationToast('Peraturan berhasil diperbarui', 'Gagal memperbarui peraturan'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.peraturan })
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => peraturanApi.revoke(id),
    ...withMutationToast('Peraturan berhasil dicabut', 'Gagal mencabut peraturan'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.peraturan })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => peraturanApi.delete(id),
    ...withMutationToast('Peraturan berhasil dihapus', 'Gagal menghapus peraturan'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.peraturan })
    },
  })

  return {
    list,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    revoke: revokeMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRevoking: revokeMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
