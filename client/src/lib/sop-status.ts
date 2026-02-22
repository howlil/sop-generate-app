/**
 * Single source of truth untuk STATUS SOP (lifecycle dokumen SOP).
 * Dipakai di: Kepala OPD (Daftar SOP), Tim Penyusun (SOP Saya), Biro/Evaluasi.
 * Semua aktor memakai daftar status yang sama; tidak ada status lain di luar ini.
 *
 * Alur singkat:
 * - Inisiasi OPD → Draft
 * - Tim penyusun: Simpan draft → Sedang Disusun | Serahkan ke Kepala OPD → Diperiksa Kepala OPD
 * - Kepala OPD: Tidak setuju (+ komentar) → Revisi dari Kepala OPD | Setuju → Siap Dievaluasi
 * - Hanya Siap Dievaluasi dan Berlaku yang bisa diajukan evaluasi (request OPD atau pilih Biro)
 * - Request evaluasi → Diajukan Evaluasi; Inisiasi Biro → langsung Dievaluasi Tim Evaluasi
 * - Hasil evaluasi tidak sesuai → Revisi dari Tim Evaluasi; sesuai → Terverifikasi dari Kepala Biro
 * - Terverifikasi dari Kepala Biro → Disahkan → Berlaku
 * - Berlaku dapat Dicabut atau Batal
 *
 * Bukan status ini: hasil evaluasi per SOP (Sesuai, Revisi Biro, Perlu Perbaikan) = StatusHasilEvaluasi.
 */

export type StatusSOP =
  | 'Draft'
  | 'Sedang Disusun'
  | 'Diperiksa Kepala OPD'
  | 'Revisi dari Kepala OPD'
  | 'Siap Dievaluasi'
  | 'Berlaku'
  | 'Diajukan Evaluasi'
  | 'Dievaluasi Tim Evaluasi'
  | 'Revisi dari Tim Evaluasi'
  | 'Terverifikasi dari Kepala Biro'
  | 'Dicabut'
  | 'Batal'

/** Daftar semua nilai status SOP (untuk filter/option). */
export const STATUS_SOP_ALL: StatusSOP[] = [
  'Draft',
  'Sedang Disusun',
  'Diperiksa Kepala OPD',
  'Revisi dari Kepala OPD',
  'Siap Dievaluasi',
  'Berlaku',
  'Diajukan Evaluasi',
  'Dievaluasi Tim Evaluasi',
  'Revisi dari Tim Evaluasi',
  'Terverifikasi dari Kepala Biro',
  'Dicabut',
  'Batal',
]

/** Status yang boleh diajukan request evaluasi (oleh OPD) atau dipilih Biro untuk evaluasi: hanya Siap Dievaluasi dan Berlaku. */
export const STATUS_SOP_CAN_REQUEST_EVALUASI: StatusSOP[] = ['Siap Dievaluasi', 'Berlaku']

/** Status SOP yang bisa dipilih Biro untuk ditambahkan ke penugasan evaluasi: Siap Dievaluasi, Berlaku, atau sudah Diajukan Evaluasi. */
export const STATUS_SOP_CAN_SELECT_FOR_EVALUASI: StatusSOP[] = [
  'Siap Dievaluasi',
  'Berlaku',
  'Diajukan Evaluasi',
]

export function canAjukanEvaluasiSOP(status: StatusSOP): boolean {
  return STATUS_SOP_CAN_REQUEST_EVALUASI.includes(status)
}

export function canSelectSOPForEvaluasi(status: StatusSOP): boolean {
  return STATUS_SOP_CAN_SELECT_FOR_EVALUASI.includes(status)
}

/** Status hasil evaluasi per SOP (bukan status SOP). Dipakai di modul evaluasi/Biro. */
export type StatusHasilEvaluasi = 'Sesuai' | 'Perlu Perbaikan' | 'Revisi Biro'

export const STATUS_HASIL_EVALUASI_ALL: StatusHasilEvaluasi[] = [
  'Sesuai',
  'Perlu Perbaikan',
  'Revisi Biro',
]
