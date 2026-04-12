/**
 * Peraturan types - matching server schema
 */

export interface PeraturanResponse {
  id: string
  opdId: string
  namaPeraturan: string
  nomor: string
  tahun: number
  tentang: string
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

export interface SopMengait {
  id: string
  nama: string
}

export interface RiwayatVersiEntry {
  version: number
  tanggal: string
  diubahOleh: string
  sopYangMengait: SopMengait[]
}
