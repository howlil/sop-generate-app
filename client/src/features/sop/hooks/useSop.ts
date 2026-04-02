/**
 * useSop hook - TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sopApi } from '../services/sop.api'
import { queryKeys } from '@/utils/query-keys'
import { useToast } from '@/utils/ui'
import type { StatusSOP, CreateSopRequest } from '../types/sop'

const SOP_STALE_TIME = 5 * 60 * 1000 // 5 minutes

// ==================== SOP Domain Logic ====================
export function canEditSop(status: StatusSOP): boolean {
  return status === 'DRAFT' || status === 'REVISI_DARI_TIM_EVALUASI'
}

export function canKepalaOpdSignSop(
  status: StatusSOP,
  batchList: any[],
  opdName: string,
  sopId: string,
  sopNomor: string
): boolean {
  return status === 'DITANDATANGANI_KOORDINATOR'
}

export function isSopEligibleForSigning(sop: any, batchList: any[]): boolean {
  return sop.status === 'DITANDATANGANI_KOORDINATOR'
}

// ==================== Tim Penyusun Access ====================
export function canTimPenyusunRunCoordinatorActions(role: string): boolean {
  return role === 'KOORDINATOR_TIM_PENYUSUN'
}

// ==================== SOP Evaluasi ====================
export function isSopInEvaluasiList(sopId: string, evaluasiList: any[]): boolean {
  return evaluasiList.some((e) => e.sopId === sopId)
}

export function canSelectSOPForEvaluasi(sop: any, evaluasiList: any[]): boolean {
  return !isSopInEvaluasiList(sop.id, evaluasiList)
}

export function useSop(params?: { opdId?: string; status?: string }) {
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.sopList(params),
    queryFn: () => sopApi.findAll(params),
    staleTime: SOP_STALE_TIME,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateSopRequest) => sopApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sop })
      showToast('SOP berhasil dibuat', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal membuat SOP', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, judul }: { id: string; judul: string }) => sopApi.update(id, judul),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sop })
      showToast('Judul SOP berhasil diperbarui', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal memperbarui SOP', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sopApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sop })
      showToast('SOP berhasil dihapus', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menghapus SOP', 'error'),
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

export function useSopDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.sopById(id),
    queryFn: () => sopApi.findById(id),
    enabled: !!id,
    staleTime: SOP_STALE_TIME,
  })
}
