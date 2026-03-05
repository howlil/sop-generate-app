/**
 * Types SOP: status, daftar, prosedur, metadata, template, pelaksana.
 * Alur status: Draft → Sedang Disusun → Selesai → Siap Dievaluasi → (Request) Diajukan Evaluasi
 * → Tim Evaluasi: Sesuai → Dievaluasi Tim Evaluasi | Revisi Biro → Revisi dari Tim Evaluasi
 * → Kepala OPD TTD → Berlaku.
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
  | 'Terverifikasi dari Biro Organisasi'
  | 'Dicabut'
  | 'Batal'

export const STATUS_SOP_ALL: StatusSOP[] = [
  'Draft', 'Sedang Disusun', 'Diperiksa Kepala OPD', 'Revisi dari Kepala OPD',
  'Siap Dievaluasi', 'Berlaku', 'Diajukan Evaluasi', 'Dievaluasi Tim Evaluasi',
  'Revisi dari Tim Evaluasi', 'Terverifikasi dari Biro Organisasi', 'Dicabut', 'Batal',
]

/** @deprecated Import dari @/lib/domain/sop-evaluasi */
export {
  STATUS_SOP_CAN_REQUEST_EVALUASI,
  STATUS_SOP_CAN_SELECT_FOR_EVALUASI,
  canAjukanEvaluasiSOP,
  canSelectSOPForEvaluasi,
} from '@/lib/domain/sop-evaluasi'

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

export interface SOPDetailMetadata {
  institutionLogo: string
  institutionLines: string[]
  name: string
  number: string
  version: number
  createdDate: string
  revisionDate: string
  effectiveDate: string
  picName: string
  picNumber: string
  picRole: string
  section: string
  lawBasis: string[]
  implementQualification: string[]
  relatedSop: string[]
  equipment: string[]
  warning: string
  recordData: string[]
  signature: string
}

export type DetailSOPViewMetadata = Omit<SOPDetailMetadata, 'institutionLogo' | 'institutionLines'>

export interface SOPTemplate {
  id: string
  kode: string
  judul: string
  opd: string
  kategori: string
  versi: string
}

export interface PelaksanaSOP {
  id: string
  nama: string
  deskripsi: string
  jumlahPos: number
}
