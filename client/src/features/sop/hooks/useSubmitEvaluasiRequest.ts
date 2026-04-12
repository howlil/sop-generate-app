/**
 * Pure mutation hook for requesting evaluation.
 * UI state (dialog, selection) should be managed by the consuming component.
 */

import { sopApi } from "../services/sop.api";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";

export function useSubmitEvaluasiRequest() {
  return useMutationWithToast({
    mutationFn: async (sopIds: string[]) => {
      // Use Promise.allSettled to prevent partial state corruption
      const results = await Promise.allSettled(
        sopIds.map((sopId) =>
          sopApi.updateStatus(sopId, { status: "DIAJUKAN_EVALUASI" }),
        ),
      );

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        const failedCount = failed.length;
        const successCount = sopIds.length - failedCount;
        throw new Error(
          `${failedCount} SOP gagal diajukan (${successCount} berhasil). Periksa koneksi dan coba lagi.`,
        );
      }

      return results;
    },
    invalidateKeys: [queryKeys.sop],
    successMessage: "SOP berhasil diajukan ke evaluasi",
    errorMessagePrefix: "Gagal mengajukan SOP",
  });
}
