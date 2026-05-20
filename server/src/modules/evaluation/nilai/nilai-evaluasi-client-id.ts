/** Identifier stabil untuk payload JSON (bukan kolom DB). */
export function buildNilaiEvaluasiClientId(
  pengajuanEvaluasiId: string,
  detailSopId: string,
): string {
  return `${pengajuanEvaluasiId}:${detailSopId}`;
}
