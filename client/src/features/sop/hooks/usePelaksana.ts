/**
 * usePelaksana Hook - TanStack Query Implementation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sopApi } from '@/features/sop'
import { queryKeys } from '@/utils/query-keys'
import { withMutationToast } from '@/utils/handleApi'
import { useAuthStore } from '@/stores/authStore'
import type { Pelaksana } from '@/features/sop'

export interface PelaksanaSOP extends Pelaksana {
  namaLengkap: string
}

export function usePelaksana(opdId?: string) {
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
    ...withMutationToast('Pelaksana SOP berhasil ditambahkan', 'Gagal menambah pelaksana'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pelaksanaByOpd(effectiveOpdId || '') })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, namaLengkap }: { id: string; namaLengkap: string }) =>
      sopApi.updatePelaksana(id, namaLengkap),
    ...withMutationToast('Pelaksana SOP berhasil diperbarui', 'Gagal memperbarui pelaksana'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pelaksanaByOpd(effectiveOpdId || '') })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sopApi.deletePelaksana(id),
    ...withMutationToast('Pelaksana SOP berhasil dihapus', 'Gagal menghapus pelaksana'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pelaksanaByOpd(effectiveOpdId || '') })
    },
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
