/**
 * Seed data untuk detail evaluasi (lookup by id) — legacy.
 * Data mentah dari data/penugasan-detail.json.
 */

import type { EvaluasiDetailItem } from '@/lib/types/verifikasi-batch'
import evaluasiDetailJson from './data/penugasan-detail.json'

export type { EvaluasiDetailItem } from '@/lib/types/verifikasi-batch'

export const SEED_EVALUASI_DETAIL_BY_ID: Record<string, EvaluasiDetailItem> =
  evaluasiDetailJson as Record<string, EvaluasiDetailItem>
