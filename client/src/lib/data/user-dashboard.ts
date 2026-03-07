/**
 * Data layer: deskripsi dashboard per role (root route).
 * Semua akses ke user-seed untuk kartu dashboard ada di sini.
 */
import type { RoleKey } from '@/lib/constants/roles'
import { DASHBOARD_DESCRIPTIONS } from '@/lib/seed/user-seed'

export function getDashboardDescriptions(): Record<RoleKey, string> {
  return { ...DASHBOARD_DESCRIPTIONS }
}

