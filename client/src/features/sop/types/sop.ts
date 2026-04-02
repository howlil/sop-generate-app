/**
 * Complete SOP types matching server schema
 * Note: Uses shared types from @/types/common
 */

import type { 
  StatusSOP, 
  JenisLangkahProsedur, 
  SatuanWaktu, 
  JenisLampiran, 
  BagianSOP,
  StatusHasilEvaluasi,
  StatusPengajuanEvaluasi,
  JenisPengajuanEvaluasi,
} from '@/types/common'

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
}

export interface LampiranTeks {
  id: string
  sopDetailId: string
  judul: string
  jenis: JenisLampiran
  isi?: string
  createdAt: string
  updatedAt: string
}

export interface DasarHukum {
  id: string
  sopDetailId: string
  judul: string
  nomor: string
  tahun: string
  createdAt: string
  updatedAt: string
}

export interface SopTerkait {
  id: string
  sopDetailId: string
  sopTerkaitId: string
  createdAt: string
  updatedAt: string

  sopDetail?: SopDetail
  sopTerkait?: SopDetail
}

export interface LangkahSOP {
  id: string
  sopDetailId: string
  urutan: number
  kegiatan: string
  pelaksana: string
  waktu?: number
  satuanWaktu?: SatuanWaktu
  kelengkapan?: string
  output?: string
  idNextStepIfYes?: string
  idNextStepIfNo?: string
  type: JenisLangkahProsedur
  createdAt: string
  updatedAt: string
}

export interface DetailSOPPelaksana {
  id: string
  sopDetailId: string
  opdId: string
  urutan: number
  createdAt: string
  updatedAt: string

  opd?: { id: string; nama: string }
  relasiPelaksana?: DetailSOPPelaksana[]
}

// ==================== DTO TYPES ====================

export interface CreateSopRequest {
  judul: string
  opdId: string
}

export interface UpdateMetadataDto {
  judul?: string
  nomorSOP?: string
  tanggalPembuatan?: string
  tanggalEfective?: string
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

export interface CreateLangkahSOPDto {
  urutan: number
  kegiatan: string
  pelaksana: string
  waktu?: number
  satuanWaktu?: SatuanWaktu
  kelengkapan?: string
  output?: string
  idNextStepIfYes?: string
  idNextStepIfNo?: string
  type: JenisLangkahProsedur
}

export interface UpdateLangkahSOPDto {
  urutan?: number
  kegiatan?: string
  pelaksana?: string
  waktu?: number
  satuanWaktu?: SatuanWaktu
  kelengkapan?: string
  output?: string
  idNextStepIfYes?: string
  idNextStepIfNo?: string
  type?: JenisLangkahProsedur
}

export interface CreatePelaksanaDto {
  opdId: string
  urutan: number
}

export interface CreateDetailSOPPelaksanaDto {
  opdId: string
  urutan: number
}

export interface CreateLampiranTeksDto {
  judul: string
  jenis: JenisLampiran
  isi?: string
}

export interface CreateDasarHukumDto {
  judul: string
  nomor: string
  tahun: string
}

export interface CreateSopTerkaitDto {
  sopTerkaitId: string
}

// ==================== EVALUASI TYPES ====================

export interface NilaiEvaluasi {
  id: string
  pengajuanEvaluasiId: string
  sopDetailId: string
  hasil?: StatusHasilEvaluasi
  catatan?: string
  version: number
  dinilaiOlehId?: string
  createdAt: string
  updatedAt: string

  sopDetail?: { id: string; nomorSOP: string; status: string }
  dinilaiOleh?: { id: string; nama: string }
}

export interface LogNilaiEvaluasi {
  id: string
  pengajuanEvaluasiId: string
  sopDetailId: string
  evaluatorId: string
  hasilSebelum?: StatusHasilEvaluasi
  hasilSesudah?: StatusHasilEvaluasi
  catatanSebelum?: string
  catatanSesudah?: string
  createdAt: string

  evaluator?: { id: string; nama: string }
}

export interface PengajuanEvaluasi {
  id: string
  opdId: string
  jenis: JenisPengajuanEvaluasi
  status: StatusPengajuanEvaluasi
  catatan?: string
  nomorBA?: string
  tanggalPermintaan?: string
  tanggalEvaluasi?: string
  nilaiOPD?: number
  diverifikasiOlehUserId?: string
  ditandatanganiOlehKoordinatorUserId?: string
  tanggalTTDBaKoordinator?: string
  diselesaikanOlehId?: string
  tanggalDiselesaikan?: string
  version: number
  createdAt: string
  updatedAt: string

  opd?: { id: string; nama: string }
  diverifikasiOlehUser?: { id: string; nama: string }
  ditandatanganiOlehKoordinatorUser?: { id: string; nama: string }
  diselesaikanOleh?: { id: string; nama: string }
  nilaiEvaluasi?: NilaiEvaluasi[]
}

// ==================== AUDIT TYPES ====================

export interface LogEditSOP {
  id: string
  sopDetailId: string
  userId: string
  bagian: BagianSOP
  dataAwal?: Record<string, any>
  dataAkhir?: Record<string, any>
  createdAt: string

  user?: { id: string; nama: string }
}

export interface LogAudit {
  id: string
  userId: string
  action: string
  entity: string
  entityId?: string
  timestamp: string
  details?: Record<string, any>

  user?: { id: string; nama: string }
}

export interface AuditFilters {
  userId?: string
  entity?: string
  entityId?: string
  action?: string
  fromDate?: string
  toDate?: string
}
