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

/**
 * Satu batch verifikasi evaluasi per OPD (daftar SOP + BA + TTE).
 * Verifikasi Berita Acara: (1) Biro — `isVerified` + `tanggalVerifikasi`, (2) Koordinator — `isSignedByKoordinator` + `tanggalTTDBaByKoordinator`.
 * Pengesahan (SOP berlaku) hanya Kepala OPD — bukan kolom di batch ini.
 */
export interface VerifikasiBatch {
  id: string
  jenis: 'Inisiasi Biro' | 'Request OPD'
  tanggalRequest?: string
  opd: string
  sopList: SOPItem[]
  status: StatusEvaluasi
  catatan: string
  tanggalEvaluasi?: string
  /** Langkah verifikasi BA oleh Biro Organisasi (TTE). */
  isVerified?: boolean
  /** Nama evaluator / tim evaluasi yang mengerjakan batch ini. */
  timEvaluasi?: string
  nomorBA?: string
  /** Tanggal verifikasi BA oleh Biro. */
  tanggalVerifikasi?: string
  /** Langkah verifikasi BA oleh Koordinator Tim Penyusun (setelah Biro). Setelah ini Kepala OPD boleh pengesahan per SOP. */
  isSignedByKoordinator?: boolean
  tanggalTTDBaByKoordinator?: string
  namaBiro?: string
  tteSignaturePayload?: TTESignaturePayload
}
