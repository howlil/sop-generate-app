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

// Legacy aliases for backward compatibility
export type Peraturan = PeraturanResponse
export type CreatePeraturanRequest = CreatePeraturanDto
export type UpdatePeraturanRequest = UpdatePeraturanDto

// Additional types for UI
export interface RiwayatVersiEntry {
  id: string
  versi: number
  tanggal: string
  perubahan: string
  aktor: string
}
