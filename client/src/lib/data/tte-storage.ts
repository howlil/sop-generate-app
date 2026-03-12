/**
 * Data layer: TTE storage — baca/tulis localStorage untuk profile, signatures, audit log.
 * URL utilities (getValidasiPengesahanUrl, getTTEVerificationSuccessUrl) juga di sini
 * karena bergantung pada window.location — bukan pure domain logic.
 */
import type { TTEProfile, TTESignaturePayload, TTEAuditEntry, TTERole } from '@/lib/types/tte'
import { TTE_STORAGE_KEYS } from '@/lib/types/tte'

function profileKey(role: TTERole): string {
  return TTE_STORAGE_KEYS.PROFILE_PREFIX + role
}

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export function getValidasiPengesahanUrl(signatureId: string): string {
  return `${getBaseUrl()}/validasi/pengesahan/${signatureId}`
}

export function getTTEVerificationSuccessUrl(token: string): string {
  return `${getBaseUrl()}/validasi/ttd/berhasil?token=${encodeURIComponent(token)}`
}

export function getTTEProfile(role: TTERole): TTEProfile | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(profileKey(role))
  if (!raw) return null
  try {
    return JSON.parse(raw) as TTEProfile
  } catch {
    return null
  }
}

export function setTTEProfile(
  role: TTERole,
  profile: Omit<TTEProfile, 'createdAt'> & { createdAt?: string }
): void {
  const full: TTEProfile = {
    ...profile,
    createdAt: profile.createdAt ?? new Date().toISOString(),
  }
  localStorage.setItem(profileKey(role), JSON.stringify(full))
}

export function getTTEProfileByVerificationToken(token: string): TTEProfile | null {
  if (typeof window === 'undefined' || !token) return null
  for (const role of ['kepala-opd', 'biro-organisasi', 'tim-penyusun'] as TTERole[]) {
    const p = getTTEProfile(role)
    if (p?.verificationToken === token) return p
  }
  return null
}

export function verifyTTEEmail(token: string): TTERole | null {
  const profile = getTTEProfileByVerificationToken(token)
  if (!profile) return null
  setTTEProfile(profile.role, {
    ...profile,
    emailVerified: true,
    verificationToken: undefined,
  })
  return profile.role
}

export function getTTESignatures(): TTESignaturePayload[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(TTE_STORAGE_KEYS.SIGNATURES)
  if (!raw) return []
  try {
    return JSON.parse(raw) as TTESignaturePayload[]
  } catch {
    return []
  }
}

function saveTTESignatures(list: TTESignaturePayload[]): void {
  localStorage.setItem(TTE_STORAGE_KEYS.SIGNATURES, JSON.stringify(list))
}

export function getTTEAuditLog(): TTEAuditEntry[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(TTE_STORAGE_KEYS.AUDIT_LOG)
  if (!raw) return []
  try {
    return JSON.parse(raw) as TTEAuditEntry[]
  } catch {
    return []
  }
}

function appendAuditEntry(entry: TTEAuditEntry): void {
  const log = getTTEAuditLog()
  log.unshift(entry)
  localStorage.setItem(TTE_STORAGE_KEYS.AUDIT_LOG, JSON.stringify(log))
}

export function addTTESignature(
  role: TTERole,
  nip: string,
  nama: string,
  documentId: string,
  documentLabel: string,
  referenceId: string,
  documentHash?: string
): TTESignaturePayload {
  const id = 'sig_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
  const signedAt = new Date().toISOString()
  const payload: TTESignaturePayload = {
    id,
    role,
    nip,
    nama,
    signedAt,
    documentId,
    documentLabel,
    referenceId,
    documentHash,
  }
  const list = getTTESignatures()
  list.unshift(payload)
  saveTTESignatures(list)

  const action = role === 'kepala-opd' ? 'pengesahan_sop' : 'verifikasi_evaluasi'
  appendAuditEntry({
    id: 'audit_' + Date.now(),
    timestamp: signedAt,
    action,
    role,
    nip,
    nama,
    documentId,
    documentLabel,
    referenceId,
    documentHash,
  })

  return payload
}

export function getTTESignatureById(id: string): TTESignaturePayload | null {
  return getTTESignatures().find((s) => s.id === id) ?? null
}
