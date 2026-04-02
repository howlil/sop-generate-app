/**
 * Role Display Utilities - Consolidated
 * All role-based display helpers in one place
 */

import { useAuthStore } from '@/stores/authStore'

export function getKepalaOPDOpdId(): string {
  const user = useAuthStore.getState().user
  return user?.opdId ?? ''
}

export function getRoleUserName(_role: string): string {
  const user = useAuthStore.getState().user
  return user?.nama ?? ''
}

export function getRoleNip(): string {
  const user = useAuthStore.getState().user
  return user?.nip ?? ''
}

export function getRoleDisplayName(): string {
  const user = useAuthStore.getState().user
  return user?.nama ?? 'User'
}
