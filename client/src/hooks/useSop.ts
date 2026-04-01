/**
 * useSop hook dengan TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sopApi } from '@/services/sop.api'
import { queryKeys } from '@/services/queryKeys'
import { showToast } from '@/stores/uiStore'
import type { CreateSopRequest } from '@/types/sop'

export function useSop(params?: { opdId?: string; status?: string }) {
  const queryClient = useQueryClient()

  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.sopList(params),
    queryFn: () => sopApi.findAll(params),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateSopRequest) => sopApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sop })
      showToast('SOP berhasil dibuat', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal membuat SOP', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, judul }: { id: string; judul: string }) => sopApi.update(id, judul),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sop })
      showToast('Judul SOP berhasil diperbarui', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal memperbarui SOP', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sopApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sop })
      showToast('SOP berhasil dihapus', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menghapus SOP', 'error')
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

/**
 * Hook untuk detail SOP
 */
export function useSopDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.sopById(id),
    queryFn: () => sopApi.findById(id),
    enabled: !!id,
  })
}
