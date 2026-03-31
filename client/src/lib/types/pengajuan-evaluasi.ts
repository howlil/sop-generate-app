/**
 * Types Pengajuan Evaluasi per ERD-DESKRIPSI.md
 * PengajuanEvaluasi menggantikan konsep "VerifikasiBatch" / "Terjadwal Evaluasi"
 * 
 * Status lifecycle: MENUNGGU_EVALUASI → SEDANG_DIEVALUASI → SELESAI_DIEVALUASI → DIVERIFIKASI_BIRO → DITANDATANGANI_KOORDINATOR → SELESAI
 * Jenis: TERJADWAL / MANDIRI — TERJADWAL punya nilaiOPD, MANDIRI harus null
 */
import type { StatusHasilEvaluasi } from '@/lib/types/sop'

export type JenisPengajuanEvaluasi = 'TERJADWAL' | 'MANDIRI'

export type StatusPengajuanEvaluasi =
  | 'MENUNGGU_EVALUASI'
  | 'SEDANG_DIEVALUASI'
  | 'SELESAI_DIEVALUASI'
  | 'DIVERIFIKASI_BIRO'
  | 'DITANDATANGANI_KOORDINATOR'
  | 'SELESAI'

/**
 * SOPItem dalam Pengajuan Evaluasi — satu SOP yang dievaluasi
 * Hasil evaluasi: SESUAI / TIDAK_SESUAI per ERD
 */
export interface SOPItem {
  id: string
  sopDetailId: string
  nama: string
  nomor: string
  hasil: StatusHasilEvaluasi | null
  catatan?: string
  rekomendasi?: string
  dinilaiOlehId?: string
  version?: number
}

/**
 * PengajuanEvaluasi — entitas evaluasi per OPD per ERD-DESKRIPSI.md
 * 
 * Constraint dari ERD:
 * - 1 PengajuanEvaluasi punya banyak NilaiEvaluasi (Restrict)
 * - 1 PengajuanEvaluasi punya banyak LogNilaiEvaluasi (Restrict)
 * - 1 PengajuanEvaluasi bisa punya 2 RiwayatTandaTangan (KOORDINATOR_TIM_PENYUSUN + BIRO_ORGANISASI untuk Berita Acara)
 * - Menggunakan optimistic locking via field version
 * - Maks 1 pengajuan aktif per OPD per jenis (di-enforce di service layer)
 */
export interface PengajuanEvaluasi {
  id: string
  opdId: string
  opdNama: string
  jenis: JenisPengajuanEvaluasi
  status: StatusPengajuanEvaluasi
  sopList: SOPItem[]
  catatan: string
  /** Nilai agregat OPD — hanya untuk jenis TERJADWAL, MANDIRI harus null */
  nilaiOPD: number | null
  version: number
  /** Diverifikasi oleh Pengguna Biro Organisasi (opsional, diisi saat diverifikasi) */
  diverifikasiOlehId?: string
  /** Diselesaikan oleh 1 evaluator (opsional, diisi saat kirim ke Biro) */
  diselesaikanOlehId?: string
  /** Denormalisasi untuk quick lookup — detail lengkap TTE ada di RiwayatTandaTangan */
  ditandatanganiOlehKoordinatorUserId?: string
  /** Timestamps */
  createdAt: string
  updatedAt: string
}

/**
 * LogNilaiEvaluasi — audit trail perubahan nilai evaluasi (immutable)
 * Per ERD: tidak merujuk NilaiEvaluasi secara FK — log tetap ada meski nilai dihapus
 */
export interface LogNilaiEvaluasi {
  id: string
  pengajuanEvaluasiId: string
  sopDetailId: string
  dinilaiOlehId: string
  dinilaiOlehNama: string
  hasilSebelum: StatusHasilEvaluasi | null
  hasilSesudah: StatusHasilEvaluasi | null
  catatanSebelum?: string
  catatanSesudah?: string
  createdAt: string
}
