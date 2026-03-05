/**
 * Centralized route path constants — single source of truth for navigation.
 */

export const ROUTES = {
  HOME: '/',

  VALIDASI: {
    TTD_BERHASIL: '/validasi/ttd/berhasil',
    PENGESAHAN: '/validasi/pengesahan/$id',
  },

  KEPALA_OPD: {
    ROOT: '/kepala-opd',
    TTD: '/kepala-opd/ttd-elektronik',
  },

  BIRO_ORGANISASI: {
    ROOT: '/biro-organisasi',
    OPD: '/biro-organisasi/manajemen-opd',
    TIM_PENYUSUN: '/biro-organisasi/manajemen-tim-penyusun',
    TIM_EVALUASI: '/biro-organisasi/manajemen-tim-evaluasi',
    EVALUASI_SOP: '/biro-organisasi/manajemen-evaluasi-sop',
    DETAIL_EVALUASI: '/biro-organisasi/manajemen-evaluasi-sop/detail/$id',
    TTD: '/biro-organisasi/ttd-elektronik',
  },

  TIM_PENYUSUN: {
    ROOT: '/tim-penyusun',
    SOP_SAYA: '/tim-penyusun/sop-saya',
    PELAKSANA_SOP: '/tim-penyusun/pelaksana-sop',
    PERATURAN: '/tim-penyusun/manajemen-peraturan',
    DAFTAR_SOP: '/tim-penyusun/daftar-sop',
    DETAIL_SOP: '/tim-penyusun/detail-sop/$id',
    INITIATE_PROYEK: '/tim-penyusun/initiate-proyek',
    TTD: '/tim-penyusun/ttd-elektronik',
  },

  TIM_EVALUASI: {
    ROOT: '/tim-evaluasi',
    /** Evaluasi SOP: list OPD (tanpa penugasan). */
    PENUGASAN: '/tim-evaluasi/penugasan',
    /** Detail evaluasi per OPD: list SOP untuk satu OPD. */
    EVALUASI_OPD: '/tim-evaluasi/penugasan/opd/$opdId',
    EVALUASI_SOP: '/tim-evaluasi/evaluasi/$sopId',
    PENUGASAN_DETAIL: '/tim-evaluasi/penugasan/detail/$id',
    PELAKSANAAN: '/tim-evaluasi/pelaksanaan/$id',
  },
} as const
