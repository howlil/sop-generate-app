/**
 * usePelaksana Hook - TanStack Query Implementation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sopApi } from '@/features/sop'
import { queryKeys } from '@/utils/query-keys'
import { useToast } from '@/utils/ui'
import { useAuthStore } from '@/stores/authStore'
import type { Pelaksana } from '@/features/sop'

export interface PelaksanaSOP extends Pelaksana {
  namaLengkap: string
}

export function usePelaksana(opdId?: string) {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const effectiveOpdId = opdId || user?.opdId

  const {
    data: list = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: queryKeys.pelaksanaByOpd(effectiveOpdId || ''),
    queryFn: () => sopApi.findPelaksana(effectiveOpdId || ''),
    enabled: !!effectiveOpdId,
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (data: { namaLengkap: string; opdId?: string }) => {
      const targetOpdId = data.opdId || effectiveOpdId
      if (!targetOpdId) throw new Error('opdId is required')
      return sopApi.createPelaksana({ opdId: targetOpdId, namaPelaksana: data.namaLengkap })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pelaksanaByOpd(effectiveOpdId || '') })
      showToast('Pelaksana SOP berhasil ditambahkan', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menambah pelaksana', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, namaLengkap }: { id: string; namaLengkap: string }) =>
      sopApi.updatePelaksana(id, namaLengkap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pelaksanaByOpd(effectiveOpdId || '') })
      showToast('Pelaksana SOP berhasil diperbarui', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal memperbarui pelaksana', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sopApi.deletePelaksana(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pelaksanaByOpd(effectiveOpdId || '') })
      showToast('Pelaksana SOP berhasil dihapus', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menghapus pelaksana', 'error'),
  })

  return {
    list,
    loading,
    error,
    addPelaksana: createMutation.mutateAsync,
    updatePelaksana: updateMutation.mutateAsync,
    removePelaksana: deleteMutation.mutateAsync,
  }
}
