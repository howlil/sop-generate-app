/**
 * Centralized domain helpers for SOP status checks.
 * Eliminates scattered magic strings across pages.
 * Workflow: Biro TTD BA → Kepala OPD TTD BA (BA milik OPD) → Kepala OPD TTD tiap SOP (Berlaku).
 */
import type { StatusSOP } from '@/lib/types/sop'
import type { VerifikasiBatch } from '@/lib/types/verifikasi-batch'

/** Status saat Tim Penyusun boleh mengedit isi SOP (alur: Draft, Sedang Disusun, revisi). Sesuai StatusSOP di lib/types/sop. */
const EDITABLE_STATUSES: StatusSOP[] = [
  'Draft',
  'Sedang Disusun',
  'Revisi dari Tim Evaluasi',
]

/** Status saat Kepala OPD boleh TTD SOP (hanya setelah Biro verifikasi BA dan Kepala OPD sudah TTD Berita Acara). */
const SIGNABLE_STATUSES: StatusSOP[] = ['Diverifikasi Biro Organisasi']

export function canEditSop(status: StatusSOP): boolean {
  return EDITABLE_STATUSES.includes(status)
}

export function isSopEligibleForSigning(status: StatusSOP): boolean {
  return SIGNABLE_STATUSES.includes(status)
}

/**
 * Mencari batch verifikasi yang berisi SOP ini untuk OPD tertentu.
 * Digunakan untuk cek apakah BA sudah ditandatangani Kepala OPD sebelum boleh TTD per SOP.
 */
export function getVerifikasiBatchContainingSop(
  batchList: VerifikasiBatch[],
  opdName: string,
  sopId: string,
  nomorSOP?: string
): VerifikasiBatch | undefined {
  return batchList.find(
    (p) =>
      p.opd === opdName &&
      (p.sopList ?? []).some(
        (s) => s.id === sopId || (nomorSOP && s.nomor === nomorSOP)
      )
  )
}

/**
 * Kepala OPD boleh TTD SOP hanya jika: (1) status SOP = Diverifikasi Biro, dan
 * (2) bila SOP masuk dalam suatu Berita Acara (batch) untuk OPD tersebut, BA harus sudah ditandatangani Kepala OPD.
 */
export function canKepalaOpdSignSop(
  status: StatusSOP,
  batchList: VerifikasiBatch[],
  opdName: string,
  sopId: string,
  nomorSOP?: string
): boolean {
  if (!isSopEligibleForSigning(status)) return false
  const batch = getVerifikasiBatchContainingSop(batchList, opdName, sopId, nomorSOP)
  if (!batch) return true
  return batch.isSignedByKepalaOPD === true
}

export function canVerifyBatch(item: VerifikasiBatch): boolean {
  return (
    item.status === 'Selesai' &&
    (item.sopList?.length ?? 0) > 0 &&
    !item.isVerified
  )
}

/** Status SOP setelah Biro verifikasi Berita Acara (semua SOP di batch dapat status ini). */
export const STATUS_SOP_AFTER_VERIFIKASI_BIRO: StatusSOP = 'Diverifikasi Biro Organisasi'

/** Daftar id SOP dari batch verifikasi (untuk update status setelah verifikasi BA). */
export function getSopIdsFromVerifikasiBatch(batch: VerifikasiBatch): string[] {
  return (batch.sopList ?? []).map((s) => s.id).filter(Boolean) as string[]
}

export function generateBANumber(verifiedCount: number): string {
  const now = new Date()
  const month = toRomanMonth(now.getMonth() + 1)
  const year = now.getFullYear()
  return `BA/BIRO/${String(verifiedCount + 1).padStart(3, '0')}/${month}/${year}`
}

function toRomanMonth(month: number): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  return roman[month - 1] ?? String(month)
}
