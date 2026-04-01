/**
 * SOP types
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

export interface Sop {
  id: string
  opdId: string
  judul: string
  createdAt: string
  updatedAt: string
  totalVersi?: number
  statusAktif?: StatusSOP
}

export interface SopDetail extends Sop {
  detailSops: SopDetailItem[]
}

export interface SopDetailItem {
  id: string
  sopId: string
  versi: number
  nomorSOP: string
  status: StatusSOP
  createdAt: string
  updatedAt: string
}

export interface CreateSopRequest {
  judul: string
  opdId: string
  logoInstansi: string
  namaLembaga: string
}
