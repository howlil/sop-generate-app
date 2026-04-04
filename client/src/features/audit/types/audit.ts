/**
 * Audit Log types matching server schema
 */

import type { BagianSOP } from '@/types/common'
export type { BagianSOP }

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
