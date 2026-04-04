/**
 * useOpd hook - TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { opdApi } from '@/features/organisasi/services/opd.api'
import { queryKeys } from '@/utils/query-keys'
import { useToast } from '@/utils/ui'
import type { CreateOpdDto, UpdateOpdDto } from '@/features/organisasi/types/opd'

type CreateOpdRequest = CreateOpdDto
type UpdateOpdRequest = UpdateOpdDto

const OPD_STALE_TIME = 5 * 60 * 1000 // 5 minutes

export function useOpd() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.opdList(),
    queryFn: () => opdApi.findAll(),
    staleTime: OPD_STALE_TIME,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateOpdRequest) => opdApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opd })
      showToast('OPD berhasil ditambahkan', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menambahkan OPD', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOpdRequest }) =>
      opdApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opd })
      showToast('OPD berhasil diperbarui', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal memperbarui OPD', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => opdApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opd })
      showToast('OPD berhasil dinonaktifkan', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menonaktifkan OPD', 'error'),
  })

  return {
    list,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useOpdDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.opdById(id),
    queryFn: () => opdApi.findById(id),
    enabled: !!id,
    staleTime: OPD_STALE_TIME,
  })
}
