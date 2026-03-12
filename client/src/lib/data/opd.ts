/**
 * Data layer: OPD dan Kepala OPD.
 * Sumber data = JSON (nanti bisa diganti API). Page tidak import JSON langsung.
 */
import type { OPD, KepalaOPD } from '@/lib/types/opd'
import opdListJson from '../seed/opd.json'

const SEED_OPD_LIST: OPD[] = opdListJson as OPD[]

const SEED_KEPALA_LIST: KepalaOPD[] = SEED_OPD_LIST.map((opd, index) => {
  const n = index + 1
  const nipSeq = n.toString().padStart(3, '0')
  const personName = `Dr. Kepala ${nipSeq}`
  return {
    id: `k${n}`,
    opdId: opd.id,
    name: personName,
    nip: `1970${nipSeq}1998031001`,
    email: `${personName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\./, '')
      .replace(/\.$/, '')}@pemda.go.id`,
    phone: `0812-1000-${nipSeq}`,
    isActive: true,
    totalSOP: opd.totalSOP,
  }
})

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
