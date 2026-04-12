/**
 * Tim (Tim Penyusun & Tim Evaluasi) types matching server schema
 */

import type { StatusTim, PeranInternalTimPenyusun } from '@/types/common'

export interface AnggotaTimPenyusun {
  id: string
  userId: string
  opdId: string
  status: StatusTim
  tanggalBergabung: string
  berakhirPada?: string
  createdAt: string
  updatedAt: string

  user?: {
    id: string
    nama: string
    email: string
    nip: string
    jabatan: string
    pangkat: string
    nohp: string
    peran: string
  }
  opd?: {
    id: string
    nama: string
  }

  jumlahSOPDisusun?: number
  peranInternal?: PeranInternalTimPenyusun
}

export interface CreateTimPenyusunDto {
  userId: string
  opdId: string
}

export interface PindahTimPenyusunDto {
  opdId: string
}

export interface AnggotaTimEvaluasi {
  id: string
  userId: string
  status: StatusTim
  tanggalBergabung: string
  berakhirPada?: string
  createdAt: string
  updatedAt: string

  user?: {
    id: string
    nama: string
    email: string
    nip: string
    jabatan: string
    pangkat: string
    nohp: string
    peran: string
  }
}

export interface CreateTimEvaluasiDto {
  userId: string
}

export interface UpdateTimEvaluasiDto {
  status: StatusTim
  berakhirPada?: string
}

/**
 * Tim Penyusun Form State (UI only)
 */
export interface TimPenyusunFormState {
  namaLengkap: string
  nip: string
  jabatan: string
  pangkat: string
  email: string
  nohp: string
  roleInternal?: 'Koordinator' | 'Anggota'
}

/**
 * Tim Evaluasi Anggota - legacy UI type
 * Used in ManajemenTimEvaluasi page (flat structure for display)
 */
export interface TimEvaluasiAnggotaUI {
  id: string
  namaLengkap: string
  nip: string
  jabatan: string
  pangkat: string
  email: string
  nohp: string
  status?: string
  endedAt?: string
  [key: string]: unknown
}
