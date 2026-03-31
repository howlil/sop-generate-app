/**
 * TTE (Tanda Tangan Elektronik) types per ERD-DESKRIPSI.md
 * 
 * Entitas terkait:
 * - KredensialTTE: setup awal user sebelum bisa TTE (1:1 dengan Pengguna)
 * - RiwayatTandaTangan: log/history setiap kali TTE dilakukan
 * 
 * Peran TTE: KEPALA_OPD / BIRO_ORGANISASI / KOORDINATOR_TIM_PENYUSUN
 * 
 * XOR Constraint: RiwayatTandaTangan harus tepat satu dari sopDetailId atau pengajuanEvaluasiId
 * - Jika sopDetailId diisi: TTE SOP (hanya KEPALA_OPD)
 * - Jika pengajuanEvaluasiId diisi: TTE Berita Acara (KOORDINATOR_TIM_PENYUSUN + BIRO_ORGANISASI)
 */

export type TTERole = 'KEPALA_OPD' | 'BIRO_ORGANISASI' | 'KOORDINATOR_TIM_PENYUSUN'

/**
 * KredensialTTE — setup awal user sebelum bisa TTE
 * Per ERD: 1:1 dengan Pengguna, userId unique
 */
export interface KredensialTTE {
  id: string
  userId: string
  nip: string
  namaLengkap: string
  email: string
  jabatan: string
  pangkat: string
  nohp: string
  pinHash: string
  emailVerified: boolean
  peran: TTERole
  createdAt: string
  verificationToken?: string
}

/**
 * RiwayatTandaTangan — log/history setiap kali TTE dilakukan
 * Per ERD:
 * - Jika sopDetailId diisi: TTE SOP (hanya KEPALA_OPD, 1 SOP = maksimal 1 TTE)
 * - Jika pengajuanEvaluasiId diisi: TTE Berita Acara (1 BA = maksimal 2 TTE)
 * - XOR constraint: tepat satu dari sopDetailId atau pengajuanEvaluasiId
 */
export interface RiwayatTandaTangan {
  id: string
  userId: string
  /** XOR: tepat satu yang diisi */
  sopDetailId?: string
  /** XOR: tepat satu yang diisi */
  pengajuanEvaluasiId?: string
  peran: TTERole
  nomorDokumen: string
  jenisDokumen: 'SOP' | 'Berita Acara'
  judulDokumen: string
  documentHash: string
  signedAt: string
  createdAt: string
}

/**
 * Payload untuk tanda tangan TTE
 */
export interface TTESignaturePayload {
  id: string
  role: TTERole
  nip: string
  namaLengkap: string
  jabatan: string
  pangkat: string
  signedAt: string
  /** XOR: tepat satu yang diisi */
  sopDetailId?: string
  /** XOR: tepat satu yang diisi */
  pengajuanEvaluasiId?: string
  documentHash: string
}

/**
 * Audit entry untuk TTE
 */
export interface TTEAuditEntry {
  id: string
  timestamp: string
  action: 'TTD_BA_KOORDINATOR_TIM_PENYUSUN' | 'SAHKAN_SOP' | 'VERIFIKASI_BA'
  role: TTERole
  nip: string
  namaLengkap: string
  jabatan: string
  pangkat: string
  /** XOR: tepat satu yang diisi */
  sopDetailId?: string
  /** XOR: tepat satu yang diisi */
  pengajuanEvaluasiId?: string
  documentHash?: string
}

export const TTE_STORAGE_KEYS = {
  KREDENSIAL_PREFIX: 'tte-kredensial-',
  RIWAYAT_PREFIX: 'tte-riwayat-',
  AUDIT_LOG: 'tte-audit-log',
} as const
