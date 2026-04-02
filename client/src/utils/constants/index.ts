/**
 * Application Constants
 * Unified constants object for the entire application
 * 
 * @example
 * // New usage (recommended)
 * import { CONSTANTS } from '@/utils/constants'
 * const { ROLES, ROUTES, IA } = CONSTANTS
 * 
 * @example
 * // Direct access
 * import { CONSTANTS } from '@/utils/constants'
 * CONSTANTS.ROLES.BIRO_ORGANISASI
 * CONSTANTS.ROUTES.TIM_PENYUSUN.DASHBOARD
 * CONSTANTS.IA.NAV_BIRO_EVALUASI_TERJADWAL
 */

// ==================== TYPES ====================

export type RoleKey =
  | 'BIRO_ORGANISASI'
  | 'TIM_PENYUSUN'
  | 'KOORDINATOR_TIM_PENYUSUN'
  | 'KEPALA_OPD'
  | 'TIM_EVALUASI'

export type StatusSOP =
  | 'DRAFT'
  | 'SEDANG_DISUSUN'
  | 'SIAP_DIEVALUASI'
  | 'DIAJUKAN_EVALUASI'
  | 'SEDANG_DIEVALUASI'
  | 'REVISI_DARI_TIM_EVALUASI'
  | 'SIAP_DIVERIFIKASI'
  | 'DIVERIFIKASI_BIRO_ORGANISASI'
  | 'BERLAKU'
  | 'DICABUT'

export type StatusHasilEvaluasi = 'SESUAI' | 'TIDAK_SESUAI'

export interface StatusBadgeConfig {
  label: string
  color: string
  bgColor: string
}

// ==================== CONSTANTS ====================

export const CONSTANTS = {
  // App
  LOCALE_ID: 'id-ID' as const,
  DEFAULT_PAGE_SIZE: 10 as const,

  // Roles
  ROLES: {
    BIRO_ORGANISASI: 'BIRO_ORGANISASI',
    TIM_PENYUSUN: 'TIM_PENYUSUN',
    KOORDINATOR_TIM_PENYUSUN: 'KOORDINATOR_TIM_PENYUSUN',
    KEPALA_OPD: 'KEPALA_OPD',
    TIM_EVALUASI: 'TIM_EVALUASI',
  } as const,

  ROLE_LABELS: {
    'BIRO_ORGANISASI': 'Biro Organisasi',
    'TIM_PENYUSUN': 'Tim Penyusun',
    'KOORDINATOR_TIM_PENYUSUN': 'Koordinator Tim Penyusun',
    'KEPALA_OPD': 'Kepala OPD',
    'TIM_EVALUASI': 'Tim Evaluasi',
  } as const,

  // Routes
  ROUTES: {
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
  } as const,

  // SOP Status
  STATUS_SOP_ALL: [
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
  ] as const,

  // Evaluasi
  HASIL_EVALUASI: {
    SESUAI: 'SESUAI',
    TIDAK_SESUAI: 'TIDAK_SESUAI',
  } as const,

  STATUS_EVALUASI: {
    DIAJUKAN_EVALUASI: 'DIAJUKAN_EVALUASI',
    SEDANG_DIEVALUASI: 'SEDANG_DIEVALUASI',
    REVISI_DARI_TIM_EVALUASI: 'REVISI_DARI_TIM_EVALUASI',
    SIAP_DIVERIFIKASI: 'SIAP_DIVERIFIKASI',
  } as const,

  EVALUASI_DISPLAY_STATUS_OPTIONS: [
    { value: 'SESUAI', label: 'Sesuai' },
    { value: 'TIDAK_SESUAI', label: 'Tidak Sesuai' },
  ] as const,

  // Information Architecture (IA)
  IA: {
    // Biro Organisasi
    NAV_BIRO_EVALUASI_TERJADWAL: 'Evaluasi Terjadwal',
    NAV_BIRO_BATCH_BA: 'Manajemen Evaluasi SOP',
    NAV_BIRO_VERIFIKASI_BA: 'Verifikasi BA',

    // Tim Penyusun
    NAV_TP_BA_KOORDINATOR: 'Berita Acara Koordinator',

    // Kepala OPD
    NAV_KO_BA_PENGESAHAN: 'Berita Acara Pengesahan',

    // Document types
    BERITA_ACARA: 'Berita Acara',
    BATCH_EVALUASI_OPD: 'Batch Evaluasi OPD',
    TERJADWAL_EVALUASI_OPD: 'Terjadwal Evaluasi OPD',

    // Actions
    VERIFIKASI_BA_BIRO: 'Verifikasi Berita Acara oleh Biro',
    VERIFIKASI_BA_KOORDINATOR: 'Verifikasi Berita Acara oleh Koordinator',
    PENGESAHAN_SOP: 'Pengesahan SOP',
  } as const,

  // Status Badge Config
  STATUS_BADGE_CONFIG: {
    // SOP Status
    'Draft': { label: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    'Sedang Disusun': { label: 'Sedang Disusun', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    'Siap Dievaluasi': { label: 'Siap Dievaluasi', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    'Sedang Dievaluasi': { label: 'Sedang Dievaluasi', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    'Siap Diverifikasi': { label: 'Siap Diverifikasi', color: 'text-green-700', bgColor: 'bg-green-100' },
    'Berlaku': { label: 'Berlaku', color: 'text-green-700', bgColor: 'bg-green-100' },
    'Dicabut': { label: 'Dicabut', color: 'text-red-700', bgColor: 'bg-red-100' },
    'Revisi dari Tim Evaluasi': { label: 'Revisi', color: 'text-orange-700', bgColor: 'bg-orange-100' },

    // Tim Status
    'AKTIF': { label: 'Aktif', color: 'text-green-700', bgColor: 'bg-green-100' },
    'NONAKTIF': { label: 'Nonaktif', color: 'text-gray-700', bgColor: 'bg-gray-100' },

    // Default
    'default': { label: 'Unknown', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  } as const,
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
  return CONSTANTS.STATUS_BADGE_CONFIG[status as keyof typeof CONSTANTS.STATUS_BADGE_CONFIG] 
    || CONSTANTS.STATUS_BADGE_CONFIG['default']
}

// ==================== BACKWARD COMPATIBILITY ====================
// Re-export for gradual migration (deprecated but kept for existing code)

/** @deprecated Use CONSTANTS.ROLES instead */
export const ROLES = CONSTANTS.ROLES

/** @deprecated Use CONSTANTS.ROLE_LABELS instead */
export const ROLE_LABELS = CONSTANTS.ROLE_LABELS

/** @deprecated Use CONSTANTS.ROUTES instead */
export const ROUTES = CONSTANTS.ROUTES

/** @deprecated Use CONSTANTS.IA instead */
export const IA = CONSTANTS.IA

/** @deprecated Use CONSTANTS.HASIL_EVALUASI instead */
export const HASIL_EVALUASI = CONSTANTS.HASIL_EVALUASI

/** @deprecated Use CONSTANTS.STATUS_EVALUASI instead */
export const STATUS_EVALUASI = CONSTANTS.STATUS_EVALUASI

/** @deprecated Use CONSTANTS.STATUS_SOP_ALL instead */
export const STATUS_SOP_ALL = CONSTANTS.STATUS_SOP_ALL

/** @deprecated Use CONSTANTS.DEFAULT_PAGE_SIZE instead */
export const DEFAULT_PAGE_SIZE = CONSTANTS.DEFAULT_PAGE_SIZE

/** @deprecated Use CONSTANTS.LOCALE_ID instead */
export const LOCALE_ID = CONSTANTS.LOCALE_ID
