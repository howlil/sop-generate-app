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
    PANTAU_SOP: '/kepala-opd/pantau-sop',
    /** Berita Acara (BA) milik OPD: daftar BA yang sudah diverifikasi Biro dan menunggu TTD Kepala OPD. Setelah TTD BA, Kepala OPD boleh mengesahkan tiap SOP. */
    BERITA_ACARA: '/kepala-opd/berita-acara',
    /** Detail SOP (dengan tombol Mengesahkan/TTE bila status Diverifikasi Biro dan BA sudah ditandatangani OPD). */
    DETAIL_SOP: '/kepala-opd/detail-sop/$id',
  },

  BIRO_ORGANISASI: {
    ROOT: '/biro-organisasi',
    OPD: '/biro-organisasi/manajemen-opd',
    TIM_PENYUSUN: '/biro-organisasi/manajemen-tim-penyusun',
    TIM_EVALUASI: '/biro-organisasi/manajemen-tim-evaluasi',
    EVALUASI_SOP: '/biro-organisasi/manajemen-evaluasi-sop',
    /** Grafik evaluasi tahunan: penilaian per batch (SOP + OPD). */
    GRAFIK_EVALUASI_TAHUNAN: '/biro-organisasi/grafik-evaluasi-tahunan',
    DETAIL_EVALUASI: '/biro-organisasi/manajemen-evaluasi-sop/detail/$id',
    /** Detail dokumen SOP (view only). Jika status Terverifikasi Biro, Kepala OPD dapat tanda tangan di halaman ini. */
    DETAIL_SOP: '/biro-organisasi/detail-sop/$id',
    TTD: '/biro-organisasi/ttd-elektronik',
  },

  TIM_PENYUSUN: {
    ROOT: '/tim-penyusun',
    /** Manajemen SOP: daftar (tabel) + detail (edit/lihat). Tim Penyusun buat SOP sendiri & request ke Biro. */
    MANAJEMEN_SOP: '/tim-penyusun/manajemen-sop',
    /** Kelola Pelaksana SOP (master data untuk kolom pelaksana di edit SOP). */
    PELAKSANA_SOP: '/tim-penyusun/pelaksana-sop',
    SOP_SAYA: '/tim-penyusun/sop-saya',
    DAFTAR_SOP: '/tim-penyusun/daftar-sop',
    PERATURAN: '/tim-penyusun/manajemen-peraturan',
    DETAIL_SOP: '/tim-penyusun/detail-sop/$id',
    INITIATE_PROYEK: '/tim-penyusun/initiate-proyek',
    TTD: '/tim-penyusun/ttd-elektronik',
  },

  TIM_EVALUASI: {
    ROOT: '/tim-evaluasi',
    /** Evaluasi SOP: daftar OPD & item evaluasi. */
    EVALUASI: '/tim-evaluasi/evaluasi',
    /** Detail evaluasi per OPD: list SOP untuk satu OPD. */
    EVALUASI_OPD: '/tim-evaluasi/evaluasi/opd/$opdId',
    EVALUASI_SOP: '/tim-evaluasi/evaluasi/$sopId',
    /** Detail satu item evaluasi (legacy). */
    EVALUASI_DETAIL: '/tim-evaluasi/evaluasi/detail/$id',
    PELAKSANAAN: '/tim-evaluasi/pelaksanaan/$id',
  },
} as const
