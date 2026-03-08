/**
 * Data layer: penugasan evaluasi (OPD evaluasi, SOP per OPD, riwayat, daftar penugasan tim evaluasi).
 * Semua akses ke penugasan-evaluasi-seed dikonsolidasikan di sini.
 */
import type { PenugasanTimEvaluasiItem } from '@/lib/types/penugasan'
import type { StatusSOP } from '@/lib/types/sop'
import { EVALUASI_STORAGE_KEY } from '@/lib/constants/evaluasi'
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

export type EvaluasiRecordMap = Record<string, { date: string; evaluatorName: string }>

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

/** Merge seed + localStorage untuk peta "terakhir evaluasi per SOP". Dipakai di workspace evaluasi. */
export function loadEvaluasiRecordMap(): EvaluasiRecordMap {
  const fromSeed = getLastEvaluatedByInitial()
  if (typeof window === 'undefined') return fromSeed
  try {
    const raw = localStorage.getItem(EVALUASI_STORAGE_KEY)
    if (!raw) return fromSeed
    const parsed = JSON.parse(raw) as Record<string, { date?: string; evaluatorName?: string }>
    const fromStorage = Object.fromEntries(
      Object.entries(parsed).filter(
        ([, v]) => v && typeof v.date === 'string' && typeof v.evaluatorName === 'string'
      )
    ) as EvaluasiRecordMap
    const merged: EvaluasiRecordMap = { ...fromSeed }
    for (const [id, v] of Object.entries(fromStorage)) {
      if (!(id in fromSeed)) merged[id] = v
    }
    return merged
  } catch {
    return fromSeed
  }
}
