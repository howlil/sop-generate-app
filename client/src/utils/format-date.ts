/**
 * Format tanggal konsisten untuk tampilan UI (locale Indonesia).
 * fe.md: utils/ untuk helper umum.
 */

/** Format singkat: 20/02/2026 */
export function formatDateId(value: string | Date | null | undefined): string {
  if (value == null || value === '') return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('id-ID')
}

/** Format panjang: 20 Feb 2026 */
export function formatDateIdLong(value: string | Date | null | undefined): string {
  if (value == null || value === '') return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
