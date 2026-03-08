/**
 * Seed data untuk Detail batch evaluasi (legacy / dari Biro) — lookup by id & preview SOP.
 * Data mentah dari data/penugasan-detail.json (bentuk = response API). Ganti ke staging: panggil API, parse ke bentuk sama.
 */

import type { PenugasanDetailItem } from '@/lib/types/penugasan'
import penugasanDetailJson from './data/penugasan-detail.json'

export type { PenugasanDetailItem } from '@/lib/types/penugasan'

/** Lookup penugasan detail by id — bentuk sama dengan response API GET /penugasan-detail atau by-id. */
export const SEED_PENUGASAN_DETAIL_BY_ID: Record<string, PenugasanDetailItem> =
  penugasanDetailJson as Record<string, PenugasanDetailItem>
