import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { evaluasiApi } from "@/api/evaluasi-client";

export function useTandaiTindakLanjutSelesai(detailSopId: string | undefined) {
  return useMutationWithToast({
    mutationFn: ({
      pengajuanEvaluasiId,
      detailSopId: detailId,
    }: {
      pengajuanEvaluasiId: string
      detailSopId: string
    }) => evaluasiApi.tandaiTindakLanjutSelesai(pengajuanEvaluasiId, detailId),
    invalidateKeys: [
      queryKeys.evaluasiUmpanBalik(detailSopId ?? ''),
      queryKeys.evaluasiWorkspaceOpdAll,
      queryKeys.evaluasiWorkspacePengajuanAll,
      queryKeys.penyusunWorkbench(detailSopId ?? ''),
    ],
    successMessage: 'Umpan balik evaluasi ditandai selesai',
    errorMessagePrefix: 'Gagal menandai tindak lanjut',
  })
}
