/**
 * Data layer: peraturan dan jenis peraturan.
 * Semua akses ke peraturan-seed dikonsolidasikan di sini.
 */
import type { Peraturan, JenisPeraturan, RiwayatVersiEntry } from '@/lib/types/peraturan'
import {
  SEED_PERATURAN,
  SEED_JENIS_PERATURAN,
  SEED_RIWAYAT_VERSI_PERATURAN,
  SEED_MANAJEMEN_PERATURAN_OPD_ID,
  SEED_OPD_NAMES,
} from '@/lib/seed/peraturan-seed'
import { delay } from '@/utils/delay'

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
