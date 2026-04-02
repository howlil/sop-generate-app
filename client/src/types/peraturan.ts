/**
 * Peraturan types - matching server schema
 */

export type StatusPeraturan = 'BERLAKU' | 'DICABUT'

export interface PeraturanResponse {
  id: string
  opdId: string
  namaPeraturan: string
  nomor: string
  tahun: number
  tentang: string
  status: StatusPeraturan
  createdAt: string
  updatedAt: string
  opd?: {
    id: string
    nama: string
  }
  digunakan?: number
}

export interface CreatePeraturanDto {
  opdId: string
  namaPeraturan: string
  nomor: string
  tahun: number
  tentang: string
}

export interface UpdatePeraturanDto {
  namaPeraturan?: string
  nomor?: string
  tahun?: number
  tentang?: string
}

export type Peraturan = PeraturanResponse
