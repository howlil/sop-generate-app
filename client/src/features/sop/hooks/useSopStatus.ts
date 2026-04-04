/**
 * useSopStatus hook - TanStack Query
 * Replaces localStorage-based status simulation with real API calls
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sopApi } from '@/features/sop/services/sop.api'
import { queryKeys } from '@/utils/query-keys'
import { useToast } from '@/utils/ui'
import type { StatusSOP } from '@/types/common'

/**
 * Hook to update SOP status via real API
 * Replaces previous localStorage-based simulation
 */
export function useSopStatus() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const updateStatusMutation = useMutation({
    mutationFn: ({ sopId, status }: { sopId: string; status: StatusSOP }) =>
      sopApi.updateStatus(sopId, { status }),
    onSuccess: (_data, variables) => {
      // Invalidate both detail SOP and general SOP queries
      queryClient.invalidateQueries({ queryKey: queryKeys.detailSop })
      queryClient.invalidateQueries({ queryKey: queryKeys.sop })
      showToast(`Status SOP berhasil diubah menjadi ${variables.status}`, 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal mengubah status SOP', 'error')
    },
  })

  return {
    /**
     * Update SOP status via API
     * @param sopId - SOP Detail ID
     * @param status - New status (StatusSOP)
     */
    setSopStatusOverride: (sopId: string, status: StatusSOP) => {
      updateStatusMutation.mutate({ sopId, status })
    },

    /**
     * Update SOP status via API (async)
     * @param sopId - SOP Detail ID
     * @param status - New status (StatusSOP)
     */
    setSopStatusOverrideAsync: updateStatusMutation.mutateAsync,

    /**
     * Check if status update is in progress
     */
    isUpdating: updateStatusMutation.isPending,

    /**
     * Error from last status update attempt
     */
    error: updateStatusMutation.error,
  }
}
