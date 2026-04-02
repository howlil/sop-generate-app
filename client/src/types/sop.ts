/**
 * Complete SOP types matching server schema
 */

import type { StatusSOP, JenisLangkahProsedur, SatuanWaktu, JenisLampiran, BagianSOP } from './common'

export interface Sop {
  id: string
  opdId: string
  judul: string
  createdAt: string
  updatedAt: string
  totalVersi?: number
  statusAktif?: StatusSOP
  opd?: { nama: string }
}

export interface SopDetail {
  id: string
  sopId: string
  status: StatusSOP
  versi: number
  nomorSOP: string
  tanggalPembuatan: string
  tanggalRevisi?: string
  tanggalEfektif?: string
  logoInstansi: string
  namaLembaga: string
  lebarKolomKegiatan?: number
  lebarKolomPelaksana?: number
  lebarKolomKelengkapan?: number
  lebarKolomWaktu?: number
  lebarKolomOutput?: number
  lebarKolomKeterangan?: number
  dibuatOlehId?: string
  terakhirDieditOlehId?: string
  createdAt: string
  updatedAt: string
  
  // Relations
  sop?: Sop
  dibuatOleh?: { id: string; nama: string }
  terakhirDieditOleh?: { id: string; nama: string }
  lampiran?: LampiranTeks[]
  dasarHukum?: DasarHukum[]
  relasiSopKeluar?: SopTerkait[]
  relasiSopMasuk?: SopTerkait[]
  langkahSOP?: LangkahSOP[]
  swimlanes?: DetailSOPPelaksana[]
  nilaiEvaluasi?: NilaiEvaluasi[]
  logEditSop?: import('./audit').LogEditSOP[]
}

export interface CreateSopRequest {
  judul: string
  opdId: string
  logoInstansi: string
  namaLembaga: string
}

export interface UpdateMetadataDto {
  logoInstansi?: string
  namaLembaga?: string
  lebarKolomKegiatan?: number
  lebarKolomPelaksana?: number
  lebarKolomKelengkapan?: number
  lebarKolomWaktu?: number
  lebarKolomOutput?: number
  lebarKolomKeterangan?: number
}

export interface UpdateStatusDto {
  status: StatusSOP
}

// Lampiran Teks
export interface LampiranTeks {
  id: string
  sopDetailId: string
  jenis: JenisLampiran
  teks: string
}

export interface CreateLampiranTeksDto {
  jenis: JenisLampiran
  teks: string
}

// Dasar Hukum
export interface DasarHukum {
  sopDetailId: string
  peraturanId: string
  peraturan?: {
    id: string
    namaPeraturan: string
    nomor: string
    tahun: number
    tentang: string
  }
}

export interface CreateDasarHukumDto {
  peraturanId: string
}

// SOP Terkait
export interface SopTerkait {
  sopDetailId: string
  sopTerkaitDetailId: string
  sop?: { id: string; judul: string }
  sopTerkait?: { id: string; judul: string }
}

export interface CreateSopTerkaitDto {
  sopTerkaitDetailId: string
}

// Langkah SOP
export interface LangkahSOP {
  id: string
  sopDetailId: string
  kegiatan: string
  jenis: JenisLangkahProsedur
  urutan: number
  kelengkapan: string
  keluaran: string
  waktu: number
  satuanWaktu: SatuanWaktu
  keterangan: string
  pelaksanaId: string
  langkahSelanjutnyaYaId?: string
  langkahSelanjutnyaTidakId?: string
  createdAt: string
  updatedAt: string
  
  pelaksana?: Pelaksana
  langkahYa?: LangkahSOP
  langkahTidak?: LangkahSOP
}

export interface CreateLangkahSOPDto {
  kegiatan: string
  jenis: JenisLangkahProsedur
  urutan: number
  kelengkapan: string
  keluaran: string
  waktu: number
  satuanWaktu: SatuanWaktu
  keterangan: string
  pelaksanaId: string
  langkahSelanjutnyaYaId?: string
  langkahSelanjutnyaTidakId?: string
}

export interface UpdateLangkahSOPDto {
  kegiatan?: string
  kelengkapan?: string
  keluaran?: string
  waktu?: number
  keterangan?: string
  pelaksanaId?: string
  langkahSelanjutnyaYaId?: string
  langkahSelanjutnyaTidakId?: string
}

// Pelaksana
export interface Pelaksana {
  id: string
  opdId: string
  namaPelaksana: string
  createdAt: string
  updatedAt: string
}

export interface CreatePelaksanaDto {
  opdId: string
  namaPelaksana: string
}

export interface DetailSOPPelaksana {
  sopDetailId: string
  pelaksanaId: string
  urutan: number
  pelaksana?: Pelaksana
}

export interface CreateDetailSOPPelaksanaDto {
  pelaksanaId: string
  urutan?: number
}

// Nilai Evaluasi (for relation)
export interface NilaiEvaluasi {
  id: string
  pengajuanEvaluasiId: string
  sopDetailId: string
  hasil?: 'SESUAI' | 'TIDAK_SESUAI'
  catatan?: string
  version: number
  dinilaiOlehId?: string
  createdAt: string
  updatedAt: string
}
