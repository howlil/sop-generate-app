/**
 * Istilah alur kerja — satu sumber untuk navigasi, judul halaman, dan tooltip.
 * "Berita Acara" = dokumen; langkah verifikasi/pengesahan memakai frasa tersendiri.
 */

export const IA = {
  /** Dokumen resmi (nomor BA, daftar SOP). */
  BERITA_ACARA: 'Berita Acara',
  /** Batch evaluasi per OPD (daftar SOP yang sudah dievaluasi Tim Evaluasi). */
  BATCH_EVALUASI_OPD: 'Batch evaluasi OPD',
  /** Langkah Biro: TTE pada BA setelah semua SOP Siap Diverifikasi. */
  VERIFIKASI_BA_BIRO: 'Verifikasi BA (Biro)',
  /** Langkah Koordinator: TTE pada BA setelah Biro. */
  VERIFIKASI_BA_KOORDINATOR: 'Verifikasi BA (Koordinator)',
  /** Langkah Kepala OPD: TTE per dokumen SOP. */
  PENGESAHAN_SOP: 'Pengesahan SOP',
  /** Menu Biro: daftar batch + detail (bukan verifikasi satu SOP tunggal). */
  NAV_BIRO_BATCH_BA: 'Batch & verifikasi BA',
  /** Menu Tim Penyusun: sama dengan konteks dokumen BA + peran koordinator. */
  NAV_TP_BA_KOORDINATOR: 'Berita Acara (Koordinator)',
  /** Menu Kepala OPD: dokumen BA + pengesahan per SOP. */
  NAV_KO_BA_PENGESAHAN: 'Berita Acara & pengesahan',
} as const

