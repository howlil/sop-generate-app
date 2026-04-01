/**
 * Role display helpers
 */

import { ROLES, ROLE_LABELS, type RoleKey } from '@/utils/constants'

export function getRoleNip(role: RoleKey): string {
  // Placeholder - actual NIP from user store
  return ''
}

export function getRoleDisplayName(role: RoleKey): string {
  return ROLE_LABELS[role] || role
}

export function getRoleUserName(role: RoleKey): string {
  return ROLE_LABELS[role] || role
}
