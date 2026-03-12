/**
 * Data layer: data tampilan per role (NIP, display name, user name) dan OPD saat ini.
 * Satu titik akses ke data/user.json; page/hook tidak impor JSON langsung.
 */
import type { RoleKey } from '@/lib/constants/roles'
import userData from '../seed/user.json'

const userSeed = userData as {
  roleNips: Record<string, string>
  roleDisplayNames: Record<string, string>
  roleUserNames: Record<string, string>
  dashboardDescriptions: Record<string, string>
  kepalaOpdOpdId: string
}

const ROLE_NIPS: Record<RoleKey, string> = userSeed.roleNips as Record<RoleKey, string>
const ROLE_DISPLAY_NAMES: Record<RoleKey, string> = userSeed.roleDisplayNames as Record<RoleKey, string>
const ROLE_USER_NAMES: Record<RoleKey, string> = userSeed.roleUserNames as Record<RoleKey, string>
const KEPALA_OPD_OPD_ID = userSeed.kepalaOpdOpdId

export function getRoleNip(r: RoleKey): string {
  return ROLE_NIPS[r] ?? '-'
}

export function getRoleDisplayName(r: RoleKey): string {
  return ROLE_DISPLAY_NAMES[r] ?? r
}

export function getRoleUserName(r: RoleKey): string {
  return ROLE_USER_NAMES[r] ?? ROLE_DISPLAY_NAMES[r] ?? r
}

/** OPD id yang dipantau oleh Kepala OPD saat ini (dari seed/config). Dipakai untuk Pantau SOP, Berita Acara, dll. */
export function getKepalaOPDOpdId(): string {
  return KEPALA_OPD_OPD_ID
}
