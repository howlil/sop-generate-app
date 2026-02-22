/**
 * Types OPD dan Kepala OPD.
 */

export interface OPD {
  id: string
  name: string
  code: string
  category: string
  email: string
  phone: string
  totalSOP: number
  sopBerlaku: number
  sopDraft: number
  createdAt: string
}

export interface KepalaOPD {
  id: string
  opdId: string
  name: string
  nip: string
  email: string
  phone: string
  isActive: boolean
  startedAt: string
  endedAt?: string
  totalSOP: number
}
