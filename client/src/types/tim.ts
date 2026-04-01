/**
 * Tim (Tim Penyusun & Tim Evaluasi) types matching server schema
 */

export type StatusTim = 'AKTIF' | 'NONAKTIF'

export type PeranInternalTimPenyusun = 'Koordinator' | 'Anggota'

// Tim Penyusun
export interface AnggotaTimPenyusun {
  id: string
  userId: string
  opdId: string
  status: StatusTim
  tanggalBergabung: string
  berakhirPada?: string
  createdAt: string
  updatedAt: string
  
  // Relations
  user?: {
    id: string
    nama: string
    email: string
    nip: string
    jabatan: string
    peran: string
  }
  opd?: {
    id: string
    nama: string
  }
  
  // Computed
  jumlahSOPDisusun?: number
  peranInternal?: PeranInternalTimPenyusun
}

export interface CreateTimPenyusunDto {
  userId: string
  opdId: string
}

export interface PindahTimPenyusunDto {
  opdId: string
}

// Tim Evaluasi
export interface AnggotaTimEvaluasi {
  id: string
  userId: string
  status: StatusTim
  tanggalBergabung: string
  berakhirPada?: string
  createdAt: string
  updatedAt: string
  
  // Relations
  user?: {
    id: string
    nama: string
    email: string
    nip: string
    jabatan: string
    peran: string
  }
}

export interface CreateTimEvaluasiDto {
  userId: string
}

export interface UpdateTimEvaluasiDto {
  status: StatusTim
  berakhirPada?: string
}

// Legacy type aliases for backward compatibility
export type CreateTimPenyusunRequest = CreateTimPenyusunDto
export type CreateTimEvaluasiRequest = CreateTimEvaluasiDto
