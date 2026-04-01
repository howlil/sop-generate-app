/**
 * OPD types
 */

export interface Opd {
  id: string
  nama: string
  alamat: string
  kodePos?: string
  telepon?: string
  email?: string
  website?: string
  logoUrl?: string
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateOpdRequest {
  nama: string
  alamat: string
  kodePos?: string
  telepon?: string
  email?: string
  website?: string
  logoUrl?: string
}

export interface UpdateOpdRequest {
  nama?: string
  alamat?: string
  kodePos?: string
  telepon?: string
  email?: string
  website?: string
  logoUrl?: string
}
