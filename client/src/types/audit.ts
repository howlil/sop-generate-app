/**
 * Audit Log types matching server schema
 */

export type BagianSOP =
  | 'METADATA'
  | 'LANGKAH_SOP'
  | 'LAMPIRAN_TEKS'
  | 'DASAR_HUKUM'
  | 'PELAKSANA'
  | 'DIAGRAM'
  | 'SOP_TERKAIT'

export interface LogEditSOP {
  id: string
  sopDetailId: string
  userId: string
  bagian: BagianSOP
  entityId?: string
  keterangan?: string
  aktorRole: string
  createdAt: string
  
  // Relations
  user?: {
    id: string
    nama: string
    email: string
  }
  sopDetail?: {
    id: string
    nomorSOP: string
    judul: string
  }
}

export interface CreateLogEditSOPDto {
  sopDetailId: string
  bagian: BagianSOP
  entityId?: string
  keterangan?: string
}

export interface LogEditSOPResponse {
  data: LogEditSOP[]
  total: number
}

export interface AuditQueryParams {
  bagian?: BagianSOP
  skip?: number
  take?: number
}
