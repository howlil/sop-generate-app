/**
 * useOpd hook - TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { opdApi } from '@/features/organisasi'
import { queryKeys } from '@/utils/query-keys'
import { withMutationToast } from '@/utils/handleApi'
import type { CreateOpdRequest, UpdateOpdRequest } from '@/features/organisasi'

const OPD_STALE_TIME = 5 * 60 * 1000 // 5 minutes

export function useOpd() {
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
    ...withMutationToast('OPD berhasil ditambahkan', 'Gagal menambahkan OPD'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opd })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOpdRequest }) =>
      opdApi.update(id, payload),
    ...withMutationToast('OPD berhasil diperbarui', 'Gagal memperbarui OPD'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opd })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => opdApi.delete(id),
    ...withMutationToast('OPD berhasil dinonaktifkan', 'Gagal menonaktifkan OPD'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opd })
    },
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
