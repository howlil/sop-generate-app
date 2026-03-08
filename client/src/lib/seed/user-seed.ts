/**
 * Seed data untuk user/role: NIP, nama tampilan, deskripsi dashboard.
 * Data dari data/user.json (bentuk = response auth/user API). Ganti ke staging: panggil API user/role.
 */
import type { RoleKey } from '@/lib/constants/roles'
import userData from './data/user.json'

const data = userData as {
  roleNips: Record<string, string>
  roleDisplayNames: Record<string, string>
  roleUserNames: Record<string, string>
  dashboardDescriptions: Record<string, string>
  kepalaOpdOpdId: string
}

export const ROLE_NIPS: Record<RoleKey, string> = data.roleNips as Record<RoleKey, string>
export const ROLE_DISPLAY_NAMES: Record<RoleKey, string> = data.roleDisplayNames as Record<RoleKey, string>
export const ROLE_USER_NAMES: Record<RoleKey, string> = data.roleUserNames as Record<RoleKey, string>
export const DASHBOARD_DESCRIPTIONS: Record<RoleKey, string> = data.dashboardDescriptions as Record<RoleKey, string>
export const KEPALA_OPD_OPD_ID = data.kepalaOpdOpdId
