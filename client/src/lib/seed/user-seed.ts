/**
 * Seed data untuk user/role: NIP dummy dan nama tampilan.
 * Dipakai oleh app-store, HeaderProfile, dan route TTD.
 * Siap diganti dengan data dari auth/user API.
 */

import type { RoleKey } from '@/lib/constants/roles'

/** NIP dummy per role sampai terhubung ke data user/auth. */
export const ROLE_NIPS: Record<RoleKey, string> = {
  'kepala-opd': '197001011990031001',
  'kepala-biro-organisasi': '196512311988021002',
  'tim-evaluasi': '198003051999031003',
  'tim-penyusun': '198512152010121004',
}

/** Nama tampilan per role (dipakai di header & TTD). */
export const ROLE_DISPLAY_NAMES: Record<RoleKey, string> = {
  'kepala-opd': 'Kepala OPD',
  'kepala-biro-organisasi': 'Kepala Biro Organisasi',
  'tim-evaluasi': 'Tim Evaluasi (Evaluator)',
  'tim-penyusun': 'Tim Penyusun',
}

/** Deskripsi singkat per role untuk kartu dashboard (halaman index). */
export const DASHBOARD_DESCRIPTIONS: Record<RoleKey, string> = {
  'kepala-opd': 'Dashboard untuk kepala organisasi perangkat daerah',
  'kepala-biro-organisasi': 'Manajemen OPD, tim evaluasi, dan evaluasi SOP',
  'tim-evaluasi': 'Evaluasi dan penilaian dokumen SOP',
  'tim-penyusun': 'Penyusunan dan pengajuan SOP',
}
