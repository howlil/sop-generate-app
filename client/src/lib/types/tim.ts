/**
 * Types tim: Tim Penyusun (Kepala OPD) dan Tim Evaluasi (Biro Organisasi).
 */

import type { ActorProfile } from '@/lib/types/actor'

export interface TimPenyusun extends ActorProfile {
  id: string
  /** OPD pemilik tim penyusun (satu OPD punya banyak tim penyusun). */
  opdId: string
  /** Nomor HP kontak langsung anggota tim. */
  noHP: string
  status: 'Aktif' | 'Nonaktif'
  /** Tanggal berakhir penugasan (saat nonaktif atau pindah OPD). Data lama SOP tetap bisa diakses per OPD. */
  endedAt?: string
  jumlahSOPDisusun: number
  tanggalBergabung: string
}

export interface TimPenyusunOption {
  id: string
  nama: string
  jabatan: string
}

export interface TimEvaluasiAnggota extends ActorProfile {
  id: string
  /** Aktif = masih dalam tim; Nonaktif = penugasan berakhir. Data evaluasi/arsip tetap per penugasan. */
  status: 'Aktif' | 'Nonaktif'
  /** Tanggal berakhir penugasan (saat dinonaktifkan). */
  endedAt?: string
  jumlahEvaluasi: number
}
