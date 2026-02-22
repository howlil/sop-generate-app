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
