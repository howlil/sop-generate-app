/**
 * TTE (Tanda Tangan Elektronik) types matching server schema
 */

import type { PeranTTE } from '@/types/common'

export interface KredensialTTE {
  id: string
  userId: string
  emailTerverifikasi: boolean
  peran: PeranTTE
  createdAt: string
  updatedAt: string
  
  user?: {
    id: string
    nama: string
    email: string
    nip: string
    jabatan: string
    pangkat: string
  }
}

export interface RiwayatTandaTangan {
  id: string
  userId: string
  peran: PeranTTE
  nomorDokumen: string
  jenisDokumen: string
  judulDokumen: string
  hashDokumen: string
  sopDetailId?: string
  pengajuanEvaluasiId?: string
  ditandatanganiPada: string
  
  // Relations
  user?: { id: string; nama: string; nip: string }
  sopDetail?: {
    id: string
    nomorSOP: string
    judul: string
  }
  pengajuanEvaluasi?: {
    id: string
    nomorBA?: string
  }
}

export interface RegisterTteDto {
  nip: string
  jabatan: string
  pangkat: string
  pin: string
}

export interface VerifikasiEmailDto {
  token: string
}

export interface TandaTanganiBaDto {
  pin: string
  nomorDokumen: string
  judulDokumen: string
}

export interface TandaTanganiSopDto {
  pin: string
  nomorDokumen: string
  judulDokumen: string
}

export interface TTEHistory {
  id: string
  peran: PeranTTE
  nomorDokumen: string
  jenisDokumen: string
  judulDokumen: string
  ditandatanganiPada: string
  sopDetailId?: string
  pengajuanEvaluasiId?: string
}
