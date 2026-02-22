/**
 * TTE (Tanda Tangan Elektronik) BSRE — service: PIN, profile, signatures, audit.
 */
import type { TTEProfile, TTESignaturePayload, TTEAuditEntry, TTERole } from '@/lib/types/tte'
import { TTE_STORAGE_KEYS } from '@/lib/types/tte'

const PIN_SALT = 'tte-bsre-salt-v1'

export function hashPin(pin: string): string {
  let h = 0
  const s = PIN_SALT + pin
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    h = (h << 5) - h + c
    h = h & h
  }
  return 'pin_' + Math.abs(h).toString(36)
}

export function verifyPin(pin: string, storedHash: string): boolean {
  return hashPin(pin) === storedHash
}

function profileKey(role: TTERole): string {
  return TTE_STORAGE_KEYS.PROFILE_PREFIX + role
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
  for (const role of ['kepala-opd', 'kepala-biro-organisasi', 'tim-evaluasi'] as TTERole[]) {
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

  const action =
    role === 'kepala-opd'
      ? 'pengesahan_sop'
      : role === 'tim-evaluasi'
        ? 'tanda_hasil_evaluasi'
        : 'verifikasi_evaluasi'
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

export function getValidasiPengesahanBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export function getValidasiPengesahanUrl(signatureId: string): string {
  const base = getValidasiPengesahanBaseUrl()
  return `${base}/validasi/pengesahan/${signatureId}`
}

export function getTTEVerificationSuccessUrl(token: string): string {
  const base = getValidasiPengesahanBaseUrl()
  return `${base}/validasi/ttd/berhasil?token=${encodeURIComponent(token)}`
}
