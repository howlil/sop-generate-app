/**
 * Types penugasan evaluasi.
 */
import type { StatusHasilEvaluasi } from '@/lib/types/sop'
import type { TTESignaturePayload } from '@/lib/types/tte'

export type StatusEvaluasi =
  | 'Belum Ditugaskan'
  | 'Sudah Ditugaskan'
  | 'Selesai'
  | 'Terverifikasi'

export interface SOPItem {
  id: string
  nama: string
  nomor: string
  status?: StatusHasilEvaluasi
  catatan?: string
  rekomendasi?: string
}

export interface Penugasan {
  id: string
  jenis: 'Inisiasi Biro' | 'Request OPD'
  tanggalRequest?: string
  opd: string
  sopList: SOPItem[]
  timMonev?: string
  status: StatusEvaluasi
  catatan: string
  evaluationCaseId?: string
  tanggalEvaluasi?: string
  isVerified?: boolean
  nomorBA?: string
  tanggalVerifikasi?: string
  kepalaBiro?: string
  tteSignaturePayload?: TTESignaturePayload
}

export type JenisEvaluasi = 'Evaluasi Rutin' | 'Evaluasi Khusus' | 'Evaluasi Insidental'

export type StatusPenugasanTimEvaluasi = 'assigned' | 'in-progress' | 'completed'

export interface PenugasanTimEvaluasiItem {
  id: string
  kodePenugasan: string
  opd: string
  sop: string
  kodeSOP: string
  jenis: JenisEvaluasi
  tanggalPenugasan: string
  status: StatusPenugasanTimEvaluasi
}

export type PenugasanDetailItem = PenugasanTimEvaluasiItem
