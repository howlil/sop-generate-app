/**
 * Data layer: data tampilan per role (NIP, display name, user name).
 * Satu titik akses ke user-seed untuk keperluan role display; page/hook tidak impor seed langsung.
 */
import type { RoleKey } from '@/lib/constants/roles'
import {
  ROLE_NIPS,
  ROLE_DISPLAY_NAMES,
  ROLE_USER_NAMES,
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
