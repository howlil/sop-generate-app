/**
 * Data layer: OPD dan Kepala OPD.
 * Sumber data = seed (nanti bisa diganti API). Page tidak import seed langsung.
 */
import { SEED_OPD_LIST, SEED_KEPALA_LIST } from '@/lib/seed/opd-seed'
import type { OPD, KepalaOPD } from '@/lib/types/opd'

/** Data awal daftar OPD (untuk inisialisasi state di page). */
export function getInitialOpdList(): OPD[] {
  return [...SEED_OPD_LIST]
}

/** Data awal daftar Kepala OPD (untuk inisialisasi state di page). */
export function getInitialKepalaList(): KepalaOPD[] {
  return [...SEED_KEPALA_LIST]
}

/** Daftar OPD (sync; sumber seed). Untuk dropdown, filter, dll. */
export function getOpdList(): OPD[] {
  return [...SEED_OPD_LIST]
}

/** Alias baca-only daftar OPD. Prefer getOpdList() untuk kejelasan (sync data). */
export function useOpdList(): OPD[] {
  return getOpdList()
}
