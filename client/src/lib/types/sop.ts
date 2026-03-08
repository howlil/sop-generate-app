

/** Alur workflow SOP: Draft → Sedang Disusun → Siap Dievaluasi → Diajukan Evaluasi → Sedang Dievaluasi → (Revisi/Siap Diverifikasi) → Diverifikasi Biro → Berlaku. */
export type StatusSOP =
  | 'Draft'
  | 'Sedang Disusun'
  | 'Siap Dievaluasi'
  | 'Diajukan Evaluasi'
  | 'Sedang Dievaluasi'
  | 'Revisi dari Tim Evaluasi'
  | 'Siap Diverifikasi'
  | 'Diverifikasi Biro Organisasi'
  | 'Berlaku'
  | 'Dicabut'

export const STATUS_SOP_ALL: StatusSOP[] = [
  'Draft',
  'Sedang Disusun',
  'Siap Dievaluasi',
  'Diajukan Evaluasi',
  'Sedang Dievaluasi',
  'Revisi dari Tim Evaluasi',
  'Siap Diverifikasi',
  'Diverifikasi Biro Organisasi',
  'Berlaku',
  'Dicabut',
]

export const SOP_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  ...STATUS_SOP_ALL.map((s) => ({ value: s, label: s })),
]

export type StatusHasilEvaluasi = 'Sesuai' | 'Perlu Perbaikan' | 'Revisi Biro'

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
  /** Id OPD pemilik SOP (untuk filter Kepala OPD memantau SOP OPD-nya). */
  opdId?: string
  /** Nama pembuat/penyusun SOP (author). */
  author?: string
}

export interface SOPSayaItem {
  id: string
  nomorSOP: string
  judul: string
  versi: string
  status: StatusSOP
  terakhirDiubah: string
  komentarCount: number
  /** Nama pembuat/penyusun SOP (author). */
  author?: string
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
  dibuatOleh?: string
  /** Nama/user yang terakhir mengedit dokumen SOP */
  dieditOleh?: string
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
  nama: string
  deskripsi: string
  jumlahPos: number
}
