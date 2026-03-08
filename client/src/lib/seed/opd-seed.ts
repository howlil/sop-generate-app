/**
 * Seed data OPD dan Kepala OPD.
 * Data mentah dari data/opd.json (bentuk = response API). Ganti ke staging: panggil API, parse ke bentuk sama.
 */
import type { OPD, KepalaOPD } from '@/lib/types/opd'
import opdListJson from './data/opd.json'

/** Daftar OPD — bentuk sama dengan response API GET /opd (atau serupa). */
export const SEED_OPD_LIST: OPD[] = opdListJson as OPD[]

/** Satu Kepala OPD per OPD; di real API bisa endpoint terpisah atau nested. */
export const SEED_KEPALA_LIST: KepalaOPD[] = SEED_OPD_LIST.map((opd, index) => {
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
