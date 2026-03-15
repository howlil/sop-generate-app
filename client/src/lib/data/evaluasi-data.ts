/**
 * Data layer: evaluasi & verifikasi (riwayat evaluasi OPD/SOP, terakhir dievaluasi).
 * Semua akses ke data/penugasan-evaluasi.json dikonsolidasikan di sini.
 */
import type { VerifikasiBatch } from '@/lib/types/verifikasi-batch'
import { EVALUASI_STORAGE_KEY } from '@/lib/constants/evaluasi'
import verifikasiBatchSeedData from '../seed/penugasan-evaluasi.json'

export type EvaluasiRecordMap = Record<string, { date: string; evaluatorName: string }>

export type RiwayatEvaluasiSOPItem = {
  date: string
  evaluatorName: string
  hasil: 'Sesuai' | 'Revisi Biro'
  komentar?: string
}

export type RiwayatEvaluasiOPDItem = {
  date: string
  evaluatorName: string
  skor: number
  sopId?: string
  sopJudul?: string
}

interface VerifikasiBatchSeedResponse {
  penugasan: VerifikasiBatch[]
  minSopPerOpd: number
  statusPool: string[]
  lastEvaluatedBy: Record<string, { date: string; evaluatorName: string }>
  riwayatEvaluasiSop: Record<string, RiwayatEvaluasiSOPItem[]>
  riwayatEvaluasiOpd: Record<string, RiwayatEvaluasiOPDItem[]>
}

const data = verifikasiBatchSeedData as VerifikasiBatchSeedResponse

/** Static map from OPD name to riwayat key (OPD id). Maintained alongside seed JSON. */
const OPD_NAME_TO_ID: Record<string, string> = {
  'Dinas Pendidikan': '1',
  'Dinas Kesehatan': '2',
  'Dinas Perhubungan': '3',
  'Dinas Sosial': '4',
  'BAPPEDA': '5',
}

const RIWAYAT_EVALUASI_OPD = data.riwayatEvaluasiOpd
const RIWAYAT_EVALUASI_SOP = data.riwayatEvaluasiSop
const LAST_EVALUATED_BY = data.lastEvaluatedBy

export function getRiwayatEvaluasiOpd(): Record<string, RiwayatEvaluasiOPDItem[]> {
  return { ...RIWAYAT_EVALUASI_OPD }
}

/** Resolve OPD name → riwayat record key (OPD id). Returns null if not found. */
export function getOpdIdByName(opdNama: string): string | null {
  return OPD_NAME_TO_ID[opdNama] ?? null
}

export function getRiwayatEvaluasiSop(): Record<string, RiwayatEvaluasiSOPItem[]> {
  return { ...RIWAYAT_EVALUASI_SOP }
}

const OPD_RATING_PREFIX = 'opd_rating_'

export interface OpdRatingRecord {
  skor: number
  date: string
  evaluatorName: string
}

/** Simpan rating OPD ke localStorage setelah evaluasi selesai. */
export function saveOpdRating(opdId: string, record: OpdRatingRecord): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(OPD_RATING_PREFIX + opdId, JSON.stringify(record))
}

/** Ambil rating OPD terakhir dari localStorage. */
export function getOpdRating(opdId: string): OpdRatingRecord | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(OPD_RATING_PREFIX + opdId)
    return raw ? (JSON.parse(raw) as OpdRatingRecord) : null
  } catch {
    return null
  }
}

/** Data awal "terakhir evaluasi per SOP" (digunakan di DetailEvaluasiOPD). */
export function getLastEvaluatedByInitial(): Record<string, { date: string; evaluatorName: string }> {
  return { ...LAST_EVALUATED_BY }
}

/** Merge seed + localStorage untuk peta "terakhir evaluasi per SOP". Dipakai di workspace evaluasi.
 *  localStorage override seed — user actions selalu menang atas data awal. */
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
    // localStorage override seed: user actions (evaluasi yang sudah dilakukan) selalu menang.
    return { ...fromSeed, ...fromStorage }
  } catch {
    return fromSeed
  }
}
