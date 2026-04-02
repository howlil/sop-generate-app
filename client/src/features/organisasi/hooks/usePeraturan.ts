/**
 * usePeraturan hook - TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { peraturanApi } from '@/features/organisasi'
import { queryKeys } from '@/utils/query-keys'
import { useToast } from '@/utils/ui'
import type { CreatePeraturanRequest, UpdatePeraturanRequest } from '@/features/organisasi'

const PERATURAN_STALE_TIME = 5 * 60 * 1000 // 5 minutes

export function usePeraturan(opdId?: string) {
  const { showToast } = useToast()
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.peraturan })
      showToast('Peraturan berhasil ditambahkan', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menambahkan peraturan', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePeraturanRequest }) =>
      peraturanApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.peraturan })
      showToast('Peraturan berhasil diperbarui', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal memperbarui peraturan', 'error'),
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => peraturanApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.peraturan })
      showToast('Peraturan berhasil dicabut', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal mencabut peraturan', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => peraturanApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.peraturan })
      showToast('Peraturan berhasil dihapus', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menghapus peraturan', 'error'),
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
