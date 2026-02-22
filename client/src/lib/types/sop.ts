/**
 * Types SOP (status, daftar, prosedur).
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

export const STATUS_SOP_ALL: StatusSOP[] = [
  'Draft', 'Sedang Disusun', 'Diperiksa Kepala OPD', 'Revisi dari Kepala OPD',
  'Siap Dievaluasi', 'Berlaku', 'Diajukan Evaluasi', 'Dievaluasi Tim Evaluasi',
  'Revisi dari Tim Evaluasi', 'Terverifikasi dari Kepala Biro', 'Dicabut', 'Batal',
]

export const STATUS_SOP_CAN_REQUEST_EVALUASI: StatusSOP[] = ['Siap Dievaluasi', 'Berlaku']

export const STATUS_SOP_CAN_SELECT_FOR_EVALUASI: StatusSOP[] = [
  'Siap Dievaluasi', 'Berlaku', 'Diajukan Evaluasi',
]

export function canAjukanEvaluasiSOP(status: StatusSOP): boolean {
  return STATUS_SOP_CAN_REQUEST_EVALUASI.includes(status)
}

export function canSelectSOPForEvaluasi(status: StatusSOP): boolean {
  return STATUS_SOP_CAN_SELECT_FOR_EVALUASI.includes(status)
}

export type StatusHasilEvaluasi = 'Sesuai' | 'Perlu Perbaikan' | 'Revisi Biro'

export const STATUS_HASIL_EVALUASI_ALL: StatusHasilEvaluasi[] = [
  'Sesuai', 'Perlu Perbaikan', 'Revisi Biro',
]

export interface SOPDaftarItem {
  id: string
  nomorSOP: string
  judul: string
  deskripsi: string
  waktuPenugasan: string
  terakhirDiperbarui: string
  timPenyusun: string
  unitTerkait: string
  peraturan: string
  peraturanId: string
  status: StatusSOP
  versi: string
  kategori: string
  evaluationCaseId?: string | null
}

export interface SOPSayaItem {
  id: string
  nomorSOP: string
  judul: string
  versi: string
  status: StatusSOP
  terakhirDiubah: string
  komentarCount: number
}

export type ProsedurStepType = 'terminator' | 'task' | 'decision'

export interface ProsedurRow {
  id: string
  no: number
  kegiatan: string
  pelaksana: Record<string, string>
  mutu_kelengkapan: string
  mutu_waktu: string
  output: string
  keterangan: string
  time?: number
  time_unit?: string
  type?: ProsedurStepType
  id_next_step_if_yes?: string
  id_next_step_if_no?: string
}
