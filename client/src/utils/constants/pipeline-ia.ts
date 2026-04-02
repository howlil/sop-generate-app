/**
 * Pipeline Information Architecture (IA) Constants
 * Navigation labels and document names for consistency across roles
 */

export const IA = {
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
} as const
