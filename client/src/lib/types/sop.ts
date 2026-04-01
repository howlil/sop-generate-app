/**
 * SOP types
 */

export interface SopItem {
  id: string
  judul: string
  opdId: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface SopDetail {
  id: string
  sopId: string
  versi: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface Sop {
  id: string
  judul: string
  opdId: string
  logoInstansi?: string
  namaLembaga?: string
  createdAt: string
  updatedAt: string
}

export interface LangkahSop {
  id: string
  sopDetailId: string
  urutan: number
  kegiatan: string
  jenis: 'TASK' | 'DECISION' | 'TERMINATOR'
  pelaksanaId: string
  waktu?: number
  satuanWaktu?: string
  kelengkapan?: string
  keluaran?: string
  keterangan?: string
  langkahSelanjutnyaYaId?: string | null
  langkahSelanjutnyaTidakId?: string | null
}

export interface Pelaksana {
  id: string
  sopDetailId: string
  pelaksanaId: string
  urutan: number
}

export interface PelaksanaSOP {
  id: string
  namaPelaksana: string
  urutan: number
}

export interface LampiranTeks {
  id: string
  sopDetailId: string
  jenis: string
  teks: string
  createdAt: string
  updatedAt: string
}

export interface SOPDaftarItem {
  id: string
  judul: string
  opdId: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface SOPTemplate {
  judul: string
  opdId: string
  logoInstansi?: string
  namaLembaga?: string
}

export interface ProsedurRow {
  id: string
  urutan: number
  kegiatan: string
  pelaksana: string
  waktu?: number
  satuanWaktu?: string
  kelengkapan?: string
  keluaran?: string
}

export const SOP_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Sedang Disusun', label: 'Sedang Disusun' },
  { value: 'Siap Dievaluasi', label: 'Siap Dievaluasi' },
  { value: 'Sedang Dievaluasi', label: 'Sedang Dievaluasi' },
  { value: 'Siap Diverifikasi', label: 'Siap Diverifikasi' },
  { value: 'Berlaku', label: 'Berlaku' },
  { value: 'Dicabut', label: 'Dicabut' },
] as const
