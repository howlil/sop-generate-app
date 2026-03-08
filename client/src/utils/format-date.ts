/**
 * Format tanggal konsisten untuk tampilan UI (locale Indonesia).
 *
 * Usage: import { formatDateId, formatDateIdLong, formatDatetime } from '@/utils/format-date'
 */

import { LOCALE_ID } from '@/lib/constants/ui'

type DateInput = string | Date | null | undefined

function toDate(value: DateInput): Date | null {
  if (value == null || value === '') return null
  const d = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(d.getTime()) ? null : d
}

/** Format singkat: 20/02/2026 */
export function formatDateId(value: DateInput): string {
  const d = toDate(value)
  return d ? d.toLocaleDateString(LOCALE_ID) : '—'
}

/** Format panjang: 20 Feb 2026 */
export function formatDateIdLong(value: DateInput): string {
  const d = toDate(value)
  return d
    ? d.toLocaleDateString(LOCALE_ID, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
}

/** Format tanggal + waktu: 20 Feb 2026, 14.30 */
export function formatDatetime(value: DateInput): string {
  const d = toDate(value)
  return d
    ? d.toLocaleString(LOCALE_ID, { dateStyle: 'medium', timeStyle: 'short' })
    : '—'
}
