/**
 * Data layer: Tim Evaluasi (Tim Monev).
 * Sumber data = seed (nanti bisa diganti API/store). Page tidak import seed langsung.
 */
import { SEED_TIM_MONEV_LIST } from '@/lib/seed/tim-evaluasi-seed'
import type { TimMonev } from '@/lib/types/tim'

/** Data awal daftar Tim Evaluasi (untuk inisialisasi state di page). */
export function getInitialTimEvaluasiList(): TimMonev[] {
  return [...SEED_TIM_MONEV_LIST]
}
