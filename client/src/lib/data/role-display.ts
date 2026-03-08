/**
 * Data layer: data tampilan per role (NIP, display name, user name) dan OPD saat ini.
 * Satu titik akses ke user-seed; page/hook tidak impor seed langsung.
 */
import type { RoleKey } from '@/lib/constants/roles'
import {
  ROLE_NIPS,
  ROLE_DISPLAY_NAMES,
  ROLE_USER_NAMES,
  KEPALA_OPD_OPD_ID,
} from '@/lib/seed/user-seed'

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
