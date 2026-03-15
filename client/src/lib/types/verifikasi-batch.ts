/**
 * Types verifikasi SOP (batch per OPD) dan item evaluasi.
 */
import type { StatusHasilEvaluasi } from '@/lib/types/sop'
import type { TTESignaturePayload } from '@/lib/types/tte'

export type StatusEvaluasi =
  | 'Aktif'
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
  status: StatusEvaluasi
  catatan: string
  tanggalEvaluasi?: string
  isVerified?: boolean
  /** Nama evaluator / tim evaluasi yang mengerjakan batch ini. */
  timEvaluasi?: string
  nomorBA?: string
  tanggalVerifikasi?: string
  /** Setelah Biro TTD BA, Koordinator Tim Penyusun menandatangani BA (milik OPD tersebut). Setelah ini Kepala OPD boleh mengesahkan masing-masing SOP. */
  isSignedByKoordinator?: boolean
  tanggalTTDBaByKoordinator?: string
  namaBiro?: string
  tteSignaturePayload?: TTESignaturePayload
}
