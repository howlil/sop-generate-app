/**
 * Seed data untuk Verifikasi SOP (Biro: batch per OPD, verifikasi BA).
 * Data mentah dari data/penugasan-evaluasi.json (bentuk = response API). Relasi: opd → opd.json name, timEvaluasi → timEvaluasiOptions.
 */

import type { VerifikasiBatch, EvaluasiItem } from '@/lib/types/verifikasi-batch'
import type { StatusSOP } from '@/lib/types/sop'
import { SEED_OPD_LIST } from '@/lib/seed/opd-seed'
import verifikasiBatchSeedData from './data/penugasan-evaluasi.json'

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
  opdListEvaluasi: { id: string; nama: string; kode: string }[]
  baseSopByOpd: Record<string, Array<{ id: string; nama: string; nomor: string; status: StatusSOP }>>
  minSopPerOpd: number
  statusPool: StatusSOP[]
  timEvaluasiOptions: { id: string; nama: string }[]
  penugasanTimEvaluasi: EvaluasiItem[]
  lastEvaluatedBy: Record<string, { date: string; evaluatorName: string }>
  riwayatEvaluasiSop: Record<string, RiwayatEvaluasiSOPItem[]>
  riwayatEvaluasiOpd: Record<string, RiwayatEvaluasiOPDItem[]>
}

const data = verifikasiBatchSeedData as VerifikasiBatchSeedResponse

export const SEED_VERIFIKASI_BATCH_INITIAL: VerifikasiBatch[] = data.penugasan
export const SEED_OPD_LIST_EVALUASI = data.opdListEvaluasi
export const SEED_TIM_EVALUASI_OPTIONS = data.timEvaluasiOptions
export const SEED_EVALUASI_ITEM_LIST = data.penugasanTimEvaluasi
export const SEED_LAST_EVALUATED_BY = data.lastEvaluatedBy
export const SEED_RIWAYAT_EVALUASI_SOP = data.riwayatEvaluasiSop
export const SEED_RIWAYAT_EVALUASI_OPD = data.riwayatEvaluasiOpd

/** SOP per OPD: base dari API + dummy hingga minSopPerOpd per OPD. Relasi: key = opd.name (opd.json). */
export const SEED_SOP_BY_OPD: Record<string, Array<{ id: string; nama: string; nomor: string; status: StatusSOP }>> = (() => {
  const map: Record<string, Array<{ id: string; nama: string; nomor: string; status: StatusSOP }>> = { ...data.baseSopByOpd }
  const statusPool = data.statusPool
  SEED_OPD_LIST.forEach((opd, idx) => {
    const name = opd.name
    const existing = map[name] ? [...map[name]] : []
    const needed = Math.max(0, data.minSopPerOpd - existing.length)
    for (let i = 0; i < needed; i++) {
      const n = existing.length + 1
      const idSuffix = `${(idx + 1).toString().padStart(2, '0')}-${n}`
      existing.push({
        id: `sop-${idSuffix}`,
        nama: `SOP Dummy ${n} — ${name}`,
        nomor: `SOP/${(opd.name.split(' ')[1] ?? 'OPD').toUpperCase()}/${2026}/${idSuffix}`,
        status: statusPool[(idx + i) % statusPool.length],
      })
    }
    map[name] = existing
  })
  return map
})()
