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

/** Hook baca-only daftar OPD (untuk dropdown, filter, dll). */
export function useOpdList(): OPD[] {
  return SEED_OPD_LIST
}
