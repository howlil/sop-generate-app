/**
 * Istilah alur kerja — satu sumber untuk navigasi, judul halaman, dan tooltip.
 * "Berita Acara" = dokumen; langkah verifikasi/pengesahan memakai frasa tersendiri.
 * Istilah "Terjadwal Evaluasi" menggantikan "Batch Evaluasi" untuk konsistensi.
 */

export const IA = {
  /** Dokumen resmi (nomor BA, daftar SOP). */
  BERITA_ACARA: 'Berita Acara',
  /** Terjadwal evaluasi per OPD (daftar SOP yang sudah dievaluasi Tim Evaluasi). */
  TERJADWAL_EVALUASI_OPD: 'Terjadwal Evaluasi OPD',
  /** Langkah Biro: TTE pada BA setelah semua SOP Siap Diverifikasi. */
  VERIFIKASI_BA_BIRO: 'Verifikasi BA (Biro)',
  /** Langkah Koordinator: TTE pada BA setelah Biro. */
  VERIFIKASI_BA_KOORDINATOR: 'Verifikasi BA (Koordinator)',
  /** Langkah Kepala OPD: TTE per dokumen SOP. */
  PENGESAHAN_SOP: 'Pengesahan SOP',
  /** Menu Biro: daftar terjadwal evaluasi + detail (bukan verifikasi satu SOP tunggal). */
  NAV_BIRO_EVALUASI_TERJADWAL: 'Terjadwal Evaluasi & BA',
  /** Menu Tim Penyusun: sama dengan konteks dokumen BA + peran koordinator. */
  NAV_TP_BA_KOORDINATOR: 'Berita Acara (Koordinator)',
  /** Menu Kepala OPD: dokumen BA + pengesahan per SOP. */
  NAV_KO_BA_PENGESAHAN: 'Berita Acara & pengesahan',
  /** Alias untuk NAV_BIRO_EVALUASI_TERJADWAL (backward compatibility). */
  NAV_BIRO_BATCH_BA: 'Terjadwal Evaluasi & BA',
  /** Alias untuk TERJADWAL_EVALUASI_OPD (backward compatibility). */
  BATCH_EVALUASI_OPD: 'Terjadwal Evaluasi OPD',
} as const

