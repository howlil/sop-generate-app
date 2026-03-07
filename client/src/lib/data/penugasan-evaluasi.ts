/**
 * Data layer: penugasan evaluasi (OPD evaluasi, SOP per OPD, riwayat, daftar penugasan tim evaluasi).
 * Semua akses ke penugasan-evaluasi-seed dikonsolidasikan di sini.
 */
import type { PenugasanTimEvaluasiItem } from '@/lib/types/penugasan'
import type { StatusSOP } from '@/lib/types/sop'
import {
  SEED_OPD_LIST_EVALUASI,
  SEED_SOP_BY_OPD,
  SEED_RIWAYAT_EVALUASI_OPD,
  SEED_RIWAYAT_EVALUASI_SOP,
  SEED_PENUGASAN_TIM_EVALUASI,
  SEED_LAST_EVALUATED_BY,
  type RiwayatEvaluasiSOPItem,
  type RiwayatEvaluasiOPDItem,
} from '@/lib/seed/penugasan-evaluasi-seed'

export type { RiwayatEvaluasiSOPItem, RiwayatEvaluasiOPDItem }

export function getOpdListEvaluasi(): { id: string; nama: string; kode: string }[] {
  return [...SEED_OPD_LIST_EVALUASI]
}

export function getSopByOpd(): Record<string, Array<{ id: string; nama: string; nomor: string; status: StatusSOP }>> {
  return { ...SEED_SOP_BY_OPD }
}

export function getRiwayatEvaluasiOpd(): Record<string, RiwayatEvaluasiOPDItem[]> {
  return { ...SEED_RIWAYAT_EVALUASI_OPD }
}

export function getRiwayatEvaluasiSop(): Record<string, RiwayatEvaluasiSOPItem[]> {
  return { ...SEED_RIWAYAT_EVALUASI_SOP }
}

export function getPenugasanTimEvaluasiList(): PenugasanTimEvaluasiItem[] {
  return [...SEED_PENUGASAN_TIM_EVALUASI]
}

/** Data awal "terakhir evaluasi per SOP" (digunakan di DetailEvaluasiOPD). */
export function getLastEvaluatedByInitial(): Record<string, { date: string; evaluatorName: string }> {
  return { ...SEED_LAST_EVALUATED_BY }
}
