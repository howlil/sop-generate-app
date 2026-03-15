/**
 * Types peraturan.
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
  fileUrl?: string
  createdBy: string
  version: number
}

export interface RiwayatVersiEntry {
  version: number
  tanggal: string
  diubahOleh: string
  sopYangMengait: { id: string; nama: string }[]
}
