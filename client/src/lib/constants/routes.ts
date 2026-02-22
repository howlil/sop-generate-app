/**
 * Centralized route path constants — single source of truth for navigation.
 */

export const ROUTES = {
  HOME: '/',

  KEPALA_OPD: {
    ROOT: '/kepala-opd',
    TIM_PENYUSUN: '/kepala-opd/manajemen-tim-penyusun',
    PELAKSANA_SOP: '/kepala-opd/pelaksana-sop',
    PERATURAN: '/kepala-opd/manajemen-peraturan',
    DAFTAR_SOP: '/kepala-opd/daftar-sop',
    DETAIL_SOP: '/kepala-opd/detail-sop/$id',
    INITIATE_PROYEK: '/kepala-opd/initiate-proyek/$id',
    TTD: '/kepala-opd/ttd-elektronik',
  },

  KEPALA_BIRO: {
    ROOT: '/kepala-biro-organisasi',
    OPD: '/kepala-biro-organisasi/manajemen-opd',
    TIM_EVALUASI: '/kepala-biro-organisasi/manajemen-tim-evaluasi',
    EVALUASI_SOP: '/kepala-biro-organisasi/manajemen-evaluasi-sop',
    DETAIL_EVALUASI: '/kepala-biro-organisasi/manajemen-evaluasi-sop/detail/$id',
    TTD: '/kepala-biro-organisasi/ttd-elektronik',
  },

  TIM_PENYUSUN: {
    ROOT: '/tim-penyusun',
    SOP_SAYA: '/tim-penyusun/sop-saya',
    DETAIL_SOP: '/tim-penyusun/detail-sop/$id',
  },

  TIM_EVALUASI: {
    ROOT: '/tim-evaluasi',
    PENUGASAN: '/tim-evaluasi/penugasan',
    PELAKSANAAN: '/tim-evaluasi/pelaksanaan/$id',
    TTD: '/tim-evaluasi/ttd-elektronik',
  },
} as const
