/**
 * Data layer: deskripsi dashboard per role (root route).
 * Semua akses ke data/user.json untuk kartu dashboard ada di sini.
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

const DASHBOARD_DESCRIPTIONS: Record<RoleKey, string> =
  userSeed.dashboardDescriptions as Record<RoleKey, string>

export function getDashboardDescriptions(): Record<RoleKey, string> {
  return { ...DASHBOARD_DESCRIPTIONS }
}

