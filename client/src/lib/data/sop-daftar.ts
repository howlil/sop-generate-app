/**
 * Data layer: daftar SOP dan SOP Saya.
 * Semua akses ke seed sop-daftar dikonsolidasikan di sini.
 */
import type { SOPDaftarItem, SOPSayaItem } from '@/lib/types/sop'
import {
  SEED_SOP_DAFTAR,
  SEED_SOP_SAYA,
  SEED_PERATURAN_DAFTAR,
} from '@/lib/seed/sop-daftar'

/** Daftar SOP (Tim Penyusun, Tim Evaluasi, Kepala OPD) – view utama. */
export function getInitialSopDaftarList(): SOPDaftarItem[] {
  return [...SEED_SOP_DAFTAR]
}

/** Daftar SOP milik Tim Penyusun saat ini. */
export function getInitialSopSayaList(): SOPSayaItem[] {
  return [...SEED_SOP_SAYA]
}

/** Daftar peraturan yang dipakai sebagai filter/label di daftar SOP. */
export function getPeraturanDaftarOptions(): { id: string; nama: string }[] {
  return [...SEED_PERATURAN_DAFTAR]
}

