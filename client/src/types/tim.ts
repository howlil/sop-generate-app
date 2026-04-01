/**
 * Tim types (Penyusun & Evaluasi)
 */

export type StatusAnggota = 'AKTIF' | 'NONAKTIF'

export interface AnggotaTimPenyusun {
  id: string
  userId: string
  opdId: string
  status: StatusAnggota
  berakhirPada?: string | null
  createdAt: string
  updatedAt: string
  pengguna: {
    id: string
    nama: string
    email: string
    nip: string
    jabatan: string
  }
  opd: {
    id: string
    nama: string
  }
}

export interface AnggotaTimEvaluasi {
  id: string
  userId: string
  status: StatusAnggota
  berakhirPada?: string | null
  createdAt: string
  updatedAt: string
  pengguna: {
    id: string
    nama: string
    email: string
    nip: string
    jabatan: string
  }
}

export interface CreateTimPenyusunRequest {
  userId: string
  opdId: string
}

export interface CreateTimEvaluasiRequest {
  userId: string
}
