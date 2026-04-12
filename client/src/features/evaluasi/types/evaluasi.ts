/**
 * Evaluasi types matching server schema
 * Uses shared types from @/types/common
 */

import type {
  StatusHasilEvaluasi,
  JenisPengajuanEvaluasi,
  StatusPengajuanEvaluasi,
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
  SelesaiEvaluasiDto,
  RekapEvaluasi,
  RekapDetail,
} from '@/types/common'

// Re-export for backward compatibility
export type {
  StatusHasilEvaluasi,
  JenisPengajuanEvaluasi,
  StatusPengajuanEvaluasi,
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
  SelesaiEvaluasiDto,
  RekapEvaluasi,
  RekapDetail,
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
  /** Computed: OPD name shorthand */
  opdNama?: string
  /** Computed: verification date */
  tanggalVerifikasi?: string
  /** Evaluasi team name */
  timEvaluasi?: string
  /** Biro name */
  namaBiro?: string
  /** SOP list included in this pengajuan */
  sopList?: { id: string; sopDetailId: string; judul: string; nomor: string; nama: string; nomorSOP?: string; status?: string; hasil?: StatusHasilEvaluasi }[]
  /** Riwayat evaluasi (audit trail) */
  riwayatEvaluasi?: LogNilaiEvaluasi[]
  /** TTE signature payload */
  tteSignaturePayload?: unknown
  diverifikasiOlehUser?: { id: string; nama: string }
  ditandatanganiOlehKoordinatorUser?: { id: string; nama: string }
  diselesaikanOleh?: { id: string; nama: string }
  nilaiEvaluasi?: NilaiEvaluasi[]
}

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

export interface UpdatePengajuanEvaluasiDto {
  status?: StatusPengajuanEvaluasi
  catatan?: string
  nilaiOPD?: number
}

export interface CreateNilaiEvaluasiDto {
  pengajuanEvaluasiId: string
  sopDetailId: string
  hasil: StatusHasilEvaluasi
  catatan?: string
}

export interface UpdateNilaiEvaluasiDto {
  hasil?: StatusHasilEvaluasi
  catatan?: string
  version?: number
}

export interface BatchListSopItem {
  id: string
  sopDetailId: string
  judul: string
  nomorSOP: string
  status: string
  hasil?: StatusHasilEvaluasi
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
