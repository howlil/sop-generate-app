/** 
 * Status lifecycle DetailSOP per ERD-DESKRIPSI.md
 * Status lifecycle: DRAFT → SEDANG_DISUSUN → SIAP_DIEVALUASI → DIAJUKAN_EVALUASI → SEDANG_DIEVALUASI → REVISI_DARI_TIM_EVALUASI → SIAP_DIVERIFIKASI → DIVERIFIKASI_BIRO_ORGANISASI → BERLAKU / DICABUT
 * BERLAKU dan DICABUT adalah terminal — tidak bisa diubah statusnya kecuali BERLAKU → DICABUT
 */
export type StatusSOP =
  | 'DRAFT'
  | 'SEDANG_DISUSUN'
  | 'SIAP_DIEVALUASI'
  | 'DIAJUKAN_EVALUASI'
  | 'SEDANG_DIEVALUASI'
  | 'REVISI_DARI_TIM_EVALUASI'
  | 'SIAP_DIVERIFIKASI'
  | 'DIVERIFIKASI_BIRO_ORGANISASI'
  | 'BERLAKU'
  | 'DICABUT'

/** Nilai status default untuk SOP baru / fallback UI (satu sumber kebenaran dengan domain). */
export const DEFAULT_SOP_STATUS: StatusSOP = 'DRAFT'

export const STATUS_SOP_ALL: StatusSOP[] = [
  'DRAFT',
  'SEDANG_DISUSUN',
  'SIAP_DIEVALUASI',
  'DIAJUKAN_EVALUASI',
  'SEDANG_DIEVALUASI',
  'REVISI_DARI_TIM_EVALUASI',
  'SIAP_DIVERIFIKASI',
  'DIVERIFIKASI_BIRO_ORGANISASI',
  'BERLAKU',
  'DICABUT',
]

export const SOP_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  ...STATUS_SOP_ALL.map((s) => ({ value: s, label: s })),
]

/** Hasil evaluasi per ERD: SESUAI / TIDAK_SESUAI */
export type StatusHasilEvaluasi = 'SESUAI' | 'TIDAK_SESUAI'

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
  /** Id OPD pemilik SOP (untuk filter Kepala OPD memantau SOP OPD-nya). */
  opdId?: string
  /** Nama pembuat/penyusun SOP (author). */
  author?: string
  /** Nama user yang terakhir mengedit SOP. Dipakai untuk akuntabilitas shared editing. */
  lastEditedBy?: string
  /** Timestamp ISO terakhir kali SOP diedit. */
  lastEditedAt?: string
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
  /** Nama/user yang membuat dokumen SOP */
  dibuatOlehNamaLengkap?: string
  /** Nama/user yang terakhir mengedit dokumen SOP */
  dieditOlehNamaLengkap?: string
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

/** Master data pelaksana SOP (Kelola Pelaksana SOP). Dipakai di edit SOP untuk kolom pelaksana prosedur. */
export interface PelaksanaSOP {
  id: string
  namaLengkap: string
  nip: string
  jabatan: string
  pangkat: string
  email: string
  nohp: string
  deskripsi: string
  jumlahPos: number
}
