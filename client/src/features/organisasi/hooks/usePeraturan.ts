/**
 * usePeraturan hook - TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { peraturanApi } from '@/features/organisasi'
import { queryKeys } from '@/utils/query-keys'
import { useToast } from '@/utils/ui'
import type { CreatePeraturanDto as CreatePeraturanRequest, UpdatePeraturanDto as UpdatePeraturanRequest } from '../types/peraturan'

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
    // Backward-compatible aliases for legacy UI code
    initPeraturanList: (_data: unknown[]) => {
      // No-op: list comes from TanStack Query, not local state
    },
    addPeraturan: (payload: CreatePeraturanRequest) =>
      createMutation.mutateAsync(payload),
    updatePeraturan: (id: string, payload: UpdatePeraturanRequest) =>
      updateMutation.mutateAsync({ id, payload }),
    removePeraturan: (id: string) =>
      deleteMutation.mutateAsync(id),
    setPeraturanDicabut: (id: string) =>
      revokeMutation.mutateAsync(id),
  }
}

/**
 * Hook to fetch version history (riwayat versi) for a peraturan.
 * NOTE: Requires server endpoint GET /peraturan/:id/riwayat
 * Currently returns empty array until endpoint is implemented.
 */
export function usePeraturanRiwayat(_peraturanId: string) {
  // TODO: Implement when server endpoint exists
  // const { data, isLoading } = useQuery({
  //   queryKey: queryKeys.peraturanRiwayat(peraturanId),
  //   queryFn: () => peraturanApi.findRiwayat(peraturanId),
  // })
  return { data: [] as Array<{ version: number; tanggal: string; diubahOleh: string; sopYangMengait: Array<{ id: string; nama: string }> }>, isLoading: false }
}
