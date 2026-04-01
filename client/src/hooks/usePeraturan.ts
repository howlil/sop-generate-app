/**
 * usePeraturan hook dengan TanStack Query
 * Server state di-handle oleh React Query, UI state di component
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { peraturanApi } from '@/services/peraturan.api'
import { queryKeys } from '@/services/queryKeys'
import { showToast } from '@/stores/uiStore'
import type { CreatePeraturanRequest, UpdatePeraturanRequest } from '@/types/peraturan'

export function usePeraturan(opdId?: string) {
  const queryClient = useQueryClient()

  // Query: Fetch all peraturan
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.peraturanList(opdId),
    queryFn: () => peraturanApi.findAll(opdId),
  })

  // Mutation: Create
  const createMutation = useMutation({
    mutationFn: (payload: CreatePeraturanRequest) => peraturanApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.peraturan })
      showToast('Peraturan berhasil ditambahkan', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menambahkan peraturan', 'error')
    },
  })

  // Mutation: Update
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePeraturanRequest }) =>
      peraturanApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.peraturan })
      showToast('Peraturan berhasil diperbarui', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal memperbarui peraturan', 'error')
    },
  })

  // Mutation: Revoke
  const revokeMutation = useMutation({
    mutationFn: (id: string) => peraturanApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.peraturan })
      showToast('Peraturan berhasil dicabut', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal mencabut peraturan', 'error')
    },
  })

  // Mutation: Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => peraturanApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.peraturan })
      showToast('Peraturan berhasil dihapus', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menghapus peraturan', 'error')
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
