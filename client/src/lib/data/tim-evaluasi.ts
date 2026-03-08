/**
 * Data layer: Tim Evaluasi.
 * Sumber data = seed (nanti bisa diganti API/store). Page tidak import seed langsung.
 */
import { SEED_TIM_EVALUASI_ANGGOTA_LIST } from '@/lib/seed/tim-evaluasi-seed'
import type { TimEvaluasiAnggota } from '@/lib/types/tim'

/** Data awal daftar Tim Evaluasi (untuk inisialisasi state di page). */
export function getInitialTimEvaluasiList(): TimEvaluasiAnggota[] {
  return [...SEED_TIM_EVALUASI_ANGGOTA_LIST]
}
