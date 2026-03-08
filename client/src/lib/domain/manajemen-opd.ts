/**
 * Domain: aturan bisnis Manajemen OPD & Kepala OPD.
 */
import type { OPD, KepalaOPD } from '@/lib/types/opd'

/** OPD punya relasi data (SOP, dll) sehingga tidak boleh dihapus permanen. */
export function hasRelasiData(opd: OPD): boolean {
  return opd.totalSOP > 0
}

/** Kepala OPD boleh dihapus hanya jika tidak mengelola SOP. */
export function canDeleteKepala(k: KepalaOPD): boolean {
  return k.totalSOP === 0
}
