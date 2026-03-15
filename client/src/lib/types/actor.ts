/**
 * Profil aktor (pejabat/pengguna) dengan struktur data seragam di seluruh aplikasi.
 * Dipakai sebagai bentuk umum untuk Kepala OPD, Biro Organisasi, Tim Evaluasi, Tim Penyusun, dll.
 */

export interface ActorProfile {
  namaLengkap: string
  nip: string
  jabatan: string
  pangkat: string
  email: string
  nohp: string
}

