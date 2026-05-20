export type PengajuanPrintTarget = 'ba' | 'sop' | 'sop-all'

export const PRINT_DELAY_MS = 150

export const CETAK_ARSIP_DISABLED_TITLE =
  'Tersedia setelah seluruh SOP ditandatangani Kepala OPD (status pengajuan selesai).'

/** Cetak arsip hanya setelah pengajuan evaluasi SELESAI (semua TTE lengkap). */
export function canCetakArsipPengajuan(status: string | undefined): boolean {
  return status === 'SELESAI'
}

function getPrintModeClass(target: PengajuanPrintTarget): string {
  if (target === 'ba') return 'print-mode-ba'
  if (target === 'sop-all') return 'print-mode-sop-all'
  return 'print-mode-sop'
}

export function triggerPengajuanPrint(target: PengajuanPrintTarget): void {
  document.body.classList.remove('print-mode-ba', 'print-mode-sop', 'print-mode-sop-all')
  const mode = getPrintModeClass(target)
  document.body.classList.add(mode)
  const cleanup = () => {
    document.body.classList.remove(mode)
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.print()
}

export function schedulePengajuanPrint(
  target: PengajuanPrintTarget,
  delayMs: number = PRINT_DELAY_MS,
): void {
  window.setTimeout(() => triggerPengajuanPrint(target), delayMs)
}
