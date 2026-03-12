/**
 * Data layer: Tim Evaluasi.
 * Sumber data = JSON (nanti bisa diganti API/store). Page tidak import JSON langsung.
 */
import type { TimEvaluasiAnggota } from '@/lib/types/tim'
import timEvaluasiAnggotaJson from '../seed/tim-evaluasi-anggota.json'

const SEED_TIM_EVALUASI_ANGGOTA_LIST: TimEvaluasiAnggota[] =
  timEvaluasiAnggotaJson as TimEvaluasiAnggota[]

/** Data awal daftar Tim Evaluasi (untuk inisialisasi state di page). */
export function getInitialTimEvaluasiList(): TimEvaluasiAnggota[] {
  return [...SEED_TIM_EVALUASI_ANGGOTA_LIST]
}
