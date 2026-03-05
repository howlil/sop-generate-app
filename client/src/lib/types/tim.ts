/**
 * Types tim: Tim Penyusun (Kepala OPD) dan Tim Monev/Evaluasi (Biro Organisasi).
 */

import type { ActorProfile } from '@/lib/types/actor'

export interface TimPenyusun extends ActorProfile {
  id: string
  /** OPD pemilik tim penyusun (satu OPD punya banyak tim penyusun). */
  opdId: string
  /** Nomor HP kontak langsung anggota tim. */
  noHP: string
  status: 'Aktif' | 'Nonaktif'
  jumlahSOPDisusun: number
  tanggalBergabung: string
}

export interface TimPenyusunOption {
  id: string
  nama: string
  jabatan: string
}

export interface TimMonev extends ActorProfile {
  id: string
  jumlahEvaluasi: number
}
