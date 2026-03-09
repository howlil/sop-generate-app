/**
 * Data layer: detail evaluasi (lookup by id) untuk halaman Tim Evaluasi / Biro.
 */
import type { EvaluasiDetailItem } from '@/lib/types/verifikasi-batch'
import { SEED_EVALUASI_DETAIL_BY_ID } from '@/lib/seed/evaluasi-detail-seed'

export function getEvaluasiDetailById(id: string): EvaluasiDetailItem | undefined {
  return SEED_EVALUASI_DETAIL_BY_ID[id]
}
