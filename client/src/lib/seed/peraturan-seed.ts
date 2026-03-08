/**
 * Seed data untuk Manajemen Peraturan (Tim Penyusun).
 * Data mentah dari data/peraturan.json (bentuk = response API). Ganti ke staging: panggil API, parse ke bentuk sama.
 * OPD yang sedang login (mock): hanya peraturan dengan createdBy === currentOPDId yang bisa diedit.
 */

import type { Peraturan, JenisPeraturan, RiwayatVersiEntry } from '@/lib/types/peraturan'
import peraturanData from './data/peraturan.json'

export type { JenisPeraturan, RiwayatVersiEntry } from '@/lib/types/peraturan'

interface PeraturanResponse {
  manajemenOpdId: string
  jenisPeraturan: JenisPeraturan[]
  riwayatVersi: Record<string, RiwayatVersiEntry[]>
  peraturan: Peraturan[]
  opdNames: Record<string, string>
}

const data = peraturanData as PeraturanResponse

export const SEED_MANAJEMEN_PERATURAN_OPD_ID = data.manajemenOpdId
export const SEED_JENIS_PERATURAN: JenisPeraturan[] = data.jenisPeraturan
export const SEED_RIWAYAT_VERSI_PERATURAN: Record<string, RiwayatVersiEntry[]> = data.riwayatVersi
export const SEED_PERATURAN: Peraturan[] = data.peraturan
export const SEED_OPD_NAMES: Record<string, string> = data.opdNames
