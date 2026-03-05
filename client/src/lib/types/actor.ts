/**
 * Profil aktor (pejabat/pengguna) dengan struktur data seragam di seluruh aplikasi.
 * Dipakai sebagai bentuk umum untuk Kepala OPD, Biro Organisasi, Tim Evaluasi, Tim Penyusun, dll.
 */

export interface ActorProfile {
  nama: string
  nip: string
  jabatan: string
  /**
   * Pangkat/golongan (opsional untuk kasus yang belum membutuhkan).
   * Disarankan diisi untuk pejabat struktural.
   */
  pangkat?: string
  email: string
}

