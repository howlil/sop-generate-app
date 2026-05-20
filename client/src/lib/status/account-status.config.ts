import type { StatusBadgeColors } from './status-badge.types'
import { STATUS_BADGE_COLORS_DEFAULT } from './status-badge.types'

export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  AKTIF: 'Aktif',
  NONAKTIF: 'Nonaktif',
}

export const ACCOUNT_STATUS_BADGE_COLORS: Record<string, StatusBadgeColors> = {
  AKTIF: { color: 'text-green-700', bgColor: 'bg-green-100' },
  NONAKTIF: { color: 'text-gray-700', bgColor: 'bg-gray-100' },
}

export function getAccountStatusLabel(status: string): string {
  return ACCOUNT_STATUS_LABELS[status] ?? status
}

export function getAccountStatusColors(status: string): StatusBadgeColors {
  return ACCOUNT_STATUS_BADGE_COLORS[status] ?? STATUS_BADGE_COLORS_DEFAULT
}
