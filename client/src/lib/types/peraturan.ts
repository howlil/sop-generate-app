/**
 * Types peraturan.
 */

export type StatusPeraturan = 'Berlaku' | 'Dicabut'

export interface Peraturan {
  id: string
  jenisPeraturan: string
  nomor: string
  tahun: string
  tentang: string
  tanggalTerbit: string
  status: StatusPeraturan
  digunakan: number
  fileUrl?: string
  createdBy: string
  version: number
}

export interface JenisPeraturan {
  id: string
  nama: string
  kode: string
  deskripsi: string
  tingkat: 'Pusat' | 'Daerah' | 'Internal'
  jumlahPeraturan: number
  createdBy: string
}

export interface RiwayatVersiEntry {
  version: number
  tanggal: string
  diubahOleh: string
  sopYangMengait: { id: string; nama: string }[]
}
