/**
 * TTE (Tanda Tangan Elektronik) BSRE — types & payload.
 */

export type TTERole = 'kepala-opd' | 'kepala-biro-organisasi' | 'tim-evaluasi'

export interface TTEProfile {
  nip: string
  nama: string
  email: string
  pinHash: string
  emailVerified: boolean
  role: TTERole
  createdAt: string
  verificationToken?: string
}

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
  documentHash?: string
}

export interface TTESignaturePayload {
  id: string
  role: TTERole
  nip: string
  nama: string
  signedAt: string
  documentId: string
  documentLabel: string
  referenceId: string
  documentHash?: string
}

export const TTE_STORAGE_KEYS = {
  PROFILE_PREFIX: 'tte-profile-',
  SIGNATURES: 'tte-signatures',
  AUDIT_LOG: 'tte-audit-log',
} as const
