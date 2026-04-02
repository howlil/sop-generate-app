/**
 * UI Constants
 */

export const LOCALE_ID = 'id-ID'

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

export const DEFAULT_PAGE_SIZE = 10

export type RoleKey =
  | 'BIRO_ORGANISASI'
  | 'TIM_PENYUSUN'
  | 'KOORDINATOR_TIM_PENYUSUN'
  | 'KEPALA_OPD'
  | 'TIM_EVALUASI'

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
}

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
