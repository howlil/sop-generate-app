/**
 * Format tanggal untuk UI (locale Indonesia)
 * Usage: import { formatDateId, formatDateIdLong } from '@/utils/format-date'
 */

import { LOCALE_ID } from '@/utils/constants'

type DateInput = string | Date | null | undefined

function toDate(value: DateInput): Date | null {
  if (value == null || value === '') return null
  const d = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(d.getTime()) ? null : d
}

/** Format singkat: 20/02/2026 */
export function formatDateId(value: DateInput): string {
  return toDate(value)?.toLocaleDateString(LOCALE_ID) ?? '—'
}

/** Format panjang: 20 Feb 2026 */
export function formatDateIdLong(value: DateInput): string {
  const d = toDate(value)
  return d
    ? d.toLocaleDateString(LOCALE_ID, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
}

/** Format tempat & tanggal: "Padang, 20 Februari 2026" */
export function formatTempatTanggal(value: DateInput, tempat: string = 'Padang'): string {
  const d = toDate(value)
  if (!d) return '—'
  const formattedDate = d.toLocaleDateString(LOCALE_ID, { day: 'numeric', month: 'long', year: 'numeric' })
  return `${tempat}, ${formattedDate}`
}
