/**
 * Types tim: Tim Penyusun (Kepala OPD) dan Tim Monev/Evaluasi (Kepala Biro).
 */

export interface TimPenyusun {
  id: string
  nama: string
  nip: string
  jabatan: string
  email: string
  noHP: string
  status: 'Aktif' | 'Nonaktif'
  jumlahSOPDisusun: number
  tanggalBergabung: string
}

export interface TimPenyusunOption {
  id: string
  nama: string
  jabatan: string
}

export interface TimMonev {
  id: string
  name: string
  nip: string
  jabatan: string
  email: string
  jumlahEvaluasi: number
}
