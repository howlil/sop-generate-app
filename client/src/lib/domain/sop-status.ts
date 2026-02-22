/**
 * Centralized domain helpers for SOP status checks.
 * Eliminates scattered magic strings across pages.
 */
import type { StatusSOP } from '@/lib/types/sop'
import type { Penugasan } from '@/lib/types/penugasan'

const EDITABLE_STATUSES: StatusSOP[] = [
  'Draft',
  'Sedang Disusun',
  'Revisi dari Kepala OPD',
  'Revisi dari Tim Evaluasi',
]

const SIGNABLE_STATUSES: StatusSOP[] = ['Terverifikasi dari Kepala Biro']

export function canEditSop(status: StatusSOP): boolean {
  return EDITABLE_STATUSES.includes(status)
}

export function isSopEligibleForSigning(status: StatusSOP): boolean {
  return SIGNABLE_STATUSES.includes(status)
}

export function canVerifyPenugasan(item: Penugasan): boolean {
  return (
    item.status === 'Selesai' &&
    (item.sopList?.length ?? 0) > 0 &&
    !item.isVerified
  )
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
