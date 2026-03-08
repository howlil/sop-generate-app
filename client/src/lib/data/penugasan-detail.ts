/**
 * Data layer: detail penugasan (lookup by id) untuk halaman Tim Evaluasi / Biro.
 * Semua akses ke penugasan-detail-seed dikonsolidasikan di sini.
 */
import type { PenugasanDetailItem } from '@/lib/types/penugasan'
import { SEED_PENUGASAN_DETAIL_BY_ID } from '@/lib/seed/penugasan-detail-seed'

export function getPenugasanDetailById(id: string): PenugasanDetailItem | undefined {
  return SEED_PENUGASAN_DETAIL_BY_ID[id]
}
