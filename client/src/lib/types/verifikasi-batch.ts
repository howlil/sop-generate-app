/**
 * Types verifikasi SOP (batch per OPD) dan item evaluasi.
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

/** Satu batch verifikasi evaluasi per OPD (daftar SOP + BA + TTD). */
export interface VerifikasiBatch {
  id: string
  jenis: 'Inisiasi Biro' | 'Request OPD'
  tanggalRequest?: string
  opd: string
  sopList: SOPItem[]
  timEvaluasi?: string
  status: StatusEvaluasi
  catatan: string
  evaluationCaseId?: string
  tanggalEvaluasi?: string
  isVerified?: boolean
  nomorBA?: string
  tanggalVerifikasi?: string
  /** Setelah Biro TTD BA, Kepala OPD menandatangani BA (milik OPD tersebut). Baru setelah ini Kepala OPD boleh TTD tiap SOP. */
  isSignedByKepalaOPD?: boolean
  tanggalTTDBaByOpd?: string
  namaBiro?: string
  tteSignaturePayload?: TTESignaturePayload
}

export type JenisEvaluasi = 'Evaluasi Rutin' | 'Evaluasi Khusus' | 'Evaluasi Insidental'

export type StatusEvaluasiItem = 'assigned' | 'in-progress' | 'completed'

/** Item evaluasi per SOP (legacy / daftar tim evaluasi). */
export interface EvaluasiItem {
  id: string
  kodePenugasan: string
  opd: string
  sop: string
  kodeSOP: string
  jenis: JenisEvaluasi
  tanggalPenugasan: string
  status: StatusEvaluasiItem
}

export type EvaluasiDetailItem = EvaluasiItem
