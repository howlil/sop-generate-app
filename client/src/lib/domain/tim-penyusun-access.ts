/**
 * Akses berdasarkan keanggotaan Tim Penyusun (Koordinator vs Anggota).
 */
import { ROLES, type RoleKey } from '@/lib/constants/roles'
import { getRoleNip } from '@/lib/data/role-display'
import { getTimPenyusunOpdId } from '@/lib/data/role-display'
import { initTimPenyusunFromSeed } from '@/lib/data/tim-penyusun'
import { getTimPenyusunAktifByOpdId } from '@/lib/stores/tim-penyusun-store'

/**
 * Hanya Koordinator yang boleh: mengajukan evaluasi massal, verifikasi BA (halaman Koordinator).
 */
export function isKoordinatorTimPenyusunForCurrentSession(): boolean {
  initTimPenyusunFromSeed()
  const nip = getRoleNip(ROLES.TIM_PENYUSUN)
  const opdId = getTimPenyusunOpdId()
  const rows = getTimPenyusunAktifByOpdId(opdId)
  const mine = rows.find((t) => t.nip === nip)
  return mine?.roleInternal === 'Koordinator'
}

/** True jika role aktif adalah Tim Penyusun dan user adalah koordinator. */
export function canTimPenyusunRunCoordinatorActions(activeRole: RoleKey | null): boolean {
  return activeRole === ROLES.TIM_PENYUSUN && isKoordinatorTimPenyusunForCurrentSession()
}
