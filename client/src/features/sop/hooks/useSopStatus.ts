/**
 * useSopStatus hook - TanStack Query
 * Replaces localStorage-based status simulation with real API calls
 */

import { sopApi } from "@/features/sop/services/sop.api";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import type { StatusSOP } from "@/types/common";

/**
 * Hook to update SOP status via real API
 * Replaces previous localStorage-based simulation
 */
export function useSopStatus() {
  const updateStatusMutation = useMutationWithToast({
    mutationFn: ({ sopId, status }: { sopId: string; status: StatusSOP }) =>
      sopApi.updateStatus(sopId, { status }),
    invalidateKeys: [queryKeys.detailSop, queryKeys.sop],
    successMessage: "Status SOP berhasil diubah",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal mengubah status SOP",
  });

  return {
    /**
     * Update SOP status via API
     * @param sopId - SOP Detail ID
     * @param status - New status (StatusSOP)
     */
    setSopStatusOverride: (sopId: string, status: StatusSOP) => {
      updateStatusMutation.mutate({ sopId, status });
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
  };
}
