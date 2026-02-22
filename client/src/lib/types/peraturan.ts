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
