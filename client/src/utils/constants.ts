/**
 * Application Constants
 * Source of truth for all constants
 * Note: Types are imported from @/types/common
 */

import type { RoleKey, StatusSOP, StatusHasilEvaluasi, StatusBadgeConfig } from '@/types/common'

// ==================== CONSTANTS ====================

export const LOCALE_ID = 'id-ID' as const

export const DEFAULT_PAGE_SIZE = 10 as const

export const ROLES = {
  BIRO_ORGANISASI: 'BIRO_ORGANISASI',
  TIM_PENYUSUN: 'TIM_PENYUSUN',
  KOORDINATOR_TIM_PENYUSUN: 'KOORDINATOR_TIM_PENYUSUN',
  KEPALA_OPD: 'KEPALA_OPD',
  TIM_EVALUASI: 'TIM_EVALUASI',
} as const

export const ROLE_LABELS: Record<RoleKey, string> = {
  'BIRO_ORGANISASI': 'Biro Organisasi',
  'TIM_PENYUSUN': 'Tim Penyusun',
  'KOORDINATOR_TIM_PENYUSUN': 'Koordinator Tim Penyusun',
  'KEPALA_OPD': 'Kepala OPD',
  'TIM_EVALUASI': 'Tim Evaluasi',
} as const

export const ROUTES = {
  HOME: '/',
  TIM_PENYUSUN: {
    DASHBOARD: '/tim-penyusun',
    SOP_SAYA: '/tim-penyusun/sop-saya',
    MANAJEMEN_SOP: '/tim-penyusun/manajemen-sop',
    PELAKSANA: '/tim-penyusun/pelaksana',
    BERITA_ACARA: '/tim-penyusun/berita-acara',
  },
  KEPALA_OPD: {
    DASHBOARD: '/kepala-opd',
    PANTAU_SOP: '/kepala-opd/pantau-sop',
    DETAIL_SOP: '/kepala-opd/detail-sop',
    TTD: '/kepala-opd/ttd',
    BERITA_ACARA: '/kepala-opd/berita-acara',
  },
  BIRO_ORGANISASI: {
    DASHBOARD: '/biro-organisasi',
    MANAJEMEN_OPD: '/biro-organisasi/manajemen-opd',
    MANAJEMEN_TIM_PENYUSUN: '/biro-organisasi/manajemen-tim-penyusun',
    MANAJEMEN_TIM_EVALUASI: '/biro-organisasi/manajemen-tim-evaluasi',
    MANAJEMEN_EVALUASI_SOP: '/biro-organisasi/manajemen-evaluasi-sop',
    TTD: '/biro-organisasi/ttd',
  },
  TIM_EVALUASI: {
    DASHBOARD: '/tim-evaluasi',
    EVALUASI: '/tim-evaluasi/evaluasi',
    DETAIL_EVALUASI: '/tim-evaluasi/evaluasi/opd',
  },
} as const

export const STATUS_SOP_ALL = [
  'DRAFT',
  'SEDANG_DISUSUN',
  'SIAP_DIEVALUASI',
  'DIAJUKAN_EVALUASI',
  'SEDANG_DIEVALUASI',
  'REVISI_DARI_TIM_EVALUASI',
  'SIAP_DIVERIFIKASI',
  'DIVERIFIKASI_BIRO_ORGANISASI',
  'BERLAKU',
  'DICABUT',
] as const

export const HASIL_EVALUASI = {
  SESUAI: 'SESUAI',
  TIDAK_SESUAI: 'TIDAK_SESUAI',
} as const

export const STATUS_EVALUASI = {
  DIAJUKAN_EVALUASI: 'DIAJUKAN_EVALUASI',
  SEDANG_DIEVALUASI: 'SEDANG_DIEVALUASI',
  REVISI_DARI_TIM_EVALUASI: 'REVISI_DARI_TIM_EVALUASI',
  SIAP_DIVERIFIKASI: 'SIAP_DIVERIFIKASI',
} as const

export const EVALUASI_DISPLAY_STATUS_OPTIONS = [
  { value: 'SESUAI', label: 'Sesuai' },
  { value: 'TIDAK_SESUAI', label: 'Tidak Sesuai' },
] as const

export const IA = {
  NAV_BIRO_EVALUASI_TERJADWAL: 'Evaluasi Terjadwal',
  NAV_BIRO_BATCH_BA: 'Manajemen Evaluasi SOP',
  NAV_BIRO_VERIFIKASI_BA: 'Verifikasi BA',
  NAV_TP_BA_KOORDINATOR: 'Berita Acara Koordinator',
  NAV_KO_BA_PENGESAHAN: 'Berita Acara Pengesahan',
  BERITA_ACARA: 'Berita Acara',
  BATCH_EVALUASI_OPD: 'Batch Evaluasi OPD',
  TERJADWAL_EVALUASI_OPD: 'Terjadwal Evaluasi OPD',
  VERIFIKASI_BA_BIRO: 'Verifikasi Berita Acara oleh Biro',
  VERIFIKASI_BA_KOORDINATOR: 'Verifikasi Berita Acara oleh Koordinator',
  PENGESAHAN_SOP: 'Pengesahan SOP',
} as const

export const STATUS_BADGE_CONFIG = {
  'Draft': { label: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  'Sedang Disusun': { label: 'Sedang Disusun', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'Siap Dievaluasi': { label: 'Siap Dievaluasi', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'Sedang Dievaluasi': { label: 'Sedang Dievaluasi', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  'Siap Diverifikasi': { label: 'Siap Diverifikasi', color: 'text-green-700', bgColor: 'bg-green-100' },
  'Berlaku': { label: 'Berlaku', color: 'text-green-700', bgColor: 'bg-green-100' },
  'Dicabut': { label: 'Dicabut', color: 'text-red-700', bgColor: 'bg-red-100' },
  'Revisi dari Tim Evaluasi': { label: 'Revisi', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  'AKTIF': { label: 'Aktif', color: 'text-green-700', bgColor: 'bg-green-100' },
  'NONAKTIF': { label: 'Nonaktif', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  'default': { label: 'Unknown', color: 'text-gray-700', bgColor: 'bg-gray-100' },
} as const

// ==================== HELPER FUNCTIONS ====================

export function routePathPrefixForMatch(role: RoleKey): string {
  switch (role) {
    case 'TIM_PENYUSUN':
    case 'KOORDINATOR_TIM_PENYUSUN':
      return '/tim-penyusun'
    case 'KEPALA_OPD':
      return '/kepala-opd'
    case 'BIRO_ORGANISASI':
      return '/biro-organisasi'
    case 'TIM_EVALUASI':
      return '/tim-evaluasi'
    default:
      return '/'
  }
}

export function getStatusBadgeConfig(status: string): StatusBadgeConfig {
  return STATUS_BADGE_CONFIG[status as keyof typeof STATUS_BADGE_CONFIG] 
    || STATUS_BADGE_CONFIG['default']
}
