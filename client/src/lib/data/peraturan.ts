/**
 * Data layer: peraturan dan jenis peraturan.
 * Semua akses ke data/peraturan.json dikonsolidasikan di sini.
 */
import type { Peraturan, JenisPeraturan, RiwayatVersiEntry } from '@/lib/types/peraturan'
import peraturanData from '../seed/peraturan.json'
import { delay } from '@/utils/delay'

interface PeraturanResponse {
  manajemenOpdId: string
  jenisPeraturan: JenisPeraturan[]
  riwayatVersi: Record<string, RiwayatVersiEntry[]>
  peraturan: Peraturan[]
  opdNames: Record<string, string>
}

const peraturanSeed = peraturanData as PeraturanResponse

const SEED_MANAJEMEN_PERATURAN_OPD_ID = peraturanSeed.manajemenOpdId
const SEED_JENIS_PERATURAN: JenisPeraturan[] = peraturanSeed.jenisPeraturan
const SEED_RIWAYAT_VERSI_PERATURAN: Record<string, RiwayatVersiEntry[]> = peraturanSeed.riwayatVersi
const SEED_PERATURAN: Peraturan[] = peraturanSeed.peraturan
const SEED_OPD_NAMES: Record<string, string> = peraturanSeed.opdNames

export function getInitialPeraturanList(): Peraturan[] {
  return [...SEED_PERATURAN]
}

/** Async version dengan simulasi latency (mock); untuk ekspos loading state. */
export async function getInitialPeraturanListAsync(): Promise<Peraturan[]> {
  await delay(250)
  return getInitialPeraturanList()
}

export function getJenisPeraturanList(): JenisPeraturan[] {
  return [...SEED_JENIS_PERATURAN]
}

export function getRiwayatVersiPeraturanInitial(): Record<string, RiwayatVersiEntry[]> {
  return { ...SEED_RIWAYAT_VERSI_PERATURAN }
}

export function getManajemenPeraturanOpdId(): string {
  return SEED_MANAJEMEN_PERATURAN_OPD_ID
}

export function getOpdNamesForPeraturan(): Record<string, string> {
  return { ...SEED_OPD_NAMES }
}
