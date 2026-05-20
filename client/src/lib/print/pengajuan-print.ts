export type PengajuanPrintTarget = 'ba' | 'sop' | 'sop-all'

export const PRINT_DELAY_MS = 150

import { SOP_BEFORE_PRINT_EVENT } from './sop-print-events'
export { SOP_BEFORE_PRINT_EVENT }

export const CETAK_ARSIP_DISABLED_TITLE =
  'Tersedia setelah seluruh SOP ditandatangani Kepala OPD (status pengajuan selesai).'

export const CETAK_BA_DISABLED_TITLE =
  'Tersedia setelah Berita Acara ditandatangani PJ Evaluator dan PJ Penyusun.'

/** Cetak Berita Acara arsip — setelah kedua PJ menandatangani BA. */
export function canCetakBeritaAcaraPengajuan(status: string | undefined): boolean {
  return status === 'DITANDATANGANI_PJ_PENYUSUN' || status === 'SELESAI'
}

/** Cetak SOP arsip pengajuan — hanya setelah pengajuan SELESAI (semua SOP Berlaku). */
export function canCetakSopArsipPengajuan(status: string | undefined): boolean {
  return status === 'SELESAI'
}

/** @deprecated Gunakan canCetakSopArsipPengajuan */
export function canCetakArsipPengajuan(status: string | undefined): boolean {
  return canCetakSopArsipPengajuan(status)
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
  if (target === 'sop' || target === 'sop-all') {
    window.dispatchEvent(new Event(SOP_BEFORE_PRINT_EVENT))
  }
  window.print()
}

export function schedulePengajuanPrint(
  target: PengajuanPrintTarget,
  delayMs: number = PRINT_DELAY_MS,
): void {
  window.setTimeout(() => triggerPengajuanPrint(target), delayMs)
}

/** Cetak dokumen SOP (header + diagram langkah) — isolasi via `print-mode-sop`. */
export function scheduleSopDocumentPrint(delayMs: number = PRINT_DELAY_MS): void {
  schedulePengajuanPrint('sop', delayMs)
}
