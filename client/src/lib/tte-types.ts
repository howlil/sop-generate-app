/**
 * Tanda Tangan Elektronik (TTE) berstandar BSRE - types & payload.
 * Siap untuk integrasi dengan API BSRE/TTE Gateway instansi.
 */

export type TTERole = 'kepala-opd' | 'kepala-biro-organisasi' | 'tim-evaluasi'

/** Profil TTE pengguna: terdaftar dengan NIP, email, dan PIN (hash). */
export interface TTEProfile {
  nip: string
  nama: string
  email: string
  /** PIN tidak disimpan plain; hanya hash untuk verifikasi. */
  pinHash: string
  /** Setelah verifikasi email (true = siap pakai). */
  emailVerified: boolean
  role: TTERole
  createdAt: string
  /** Token untuk verifikasi via link email (dihapus setelah verifikasi). */
  verificationToken?: string
}

/** Satu entri audit log untuk aksi TTE. */
export interface TTEAuditEntry {
  id: string
  timestamp: string
  action: 'verifikasi_evaluasi' | 'pengesahan_sop' | 'tanda_hasil_evaluasi'
  role: TTERole
  nip: string
  nama: string
  documentId: string
  documentLabel: string
  referenceId: string
  /** Hash/ID dokumen yang ditandatangani (integritas). */
  documentHash?: string
}

/** Payload tanda tangan yang disimpan dan ditampilkan (termasuk untuk QR). */
export interface TTESignaturePayload {
  id: string
  role: TTERole
  nip: string
  nama: string
  signedAt: string
  documentId: string
  documentLabel: string
  /** Untuk verifikasi evaluasi: id batch/BA. Untuk pengesahan: id SOP. */
  referenceId: string
  documentHash?: string
}

/** Key localStorage untuk data TTE (mock; nanti diganti API). */
export const TTE_STORAGE_KEYS = {
  PROFILE_PREFIX: 'tte-profile-',
  SIGNATURES: 'tte-signatures',
  AUDIT_LOG: 'tte-audit-log',
} as const
