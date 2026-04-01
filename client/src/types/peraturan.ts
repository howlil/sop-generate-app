/**
 * Peraturan types
 */

export type StatusPeraturan = 'Berlaku' | 'Dicabut'

export interface Peraturan {
  id: string
  peraturan: string
  nomor: string
  tahun: string
  tentang: string
  status: StatusPeraturan
  digunakan: number
  createdBy: string
  version: number
}

export interface CreatePeraturanRequest {
  opdId: string
  namaPeraturan: string
  nomor: string
  tahun: number
  tentang: string
}

export interface UpdatePeraturanRequest {
  namaPeraturan?: string
  nomor?: string
  tahun?: number
  tentang?: string
}
