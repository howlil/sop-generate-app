/** Target aksi arsip pengajuan: unduh BA (PDF) atau cetak SOP (browser). */
export type PengajuanPrintTarget = 'ba' | 'sop'

export const PRINT_DELAY_MS = 150

import { SOP_BEFORE_PRINT_EVENT } from './sop-print-events'
import { printSopPdfDocument, type SopPdfPrintOptions } from './print-sop-pdf'
import type { SopPdfDocumentProps } from '@/components/sop/sop-pdf-document'
export { SOP_BEFORE_PRINT_EVENT }

export const CETAK_ARSIP_DISABLED_TITLE =
  'Tersedia setelah seluruh SOP ditandatangani Kepala OPD (status pengajuan selesai).'

export const CETAK_BA_DISABLED_TITLE =
  'Tersedia setelah Berita Acara ditandatangani PJ Evaluator dan PJ Penyusun.'

/** Unduh Berita Acara arsip — setelah kedua PJ menandatangani BA. */
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

export function triggerSopPrint(): void {
  document.body.classList.remove('print-mode-sop')
  document.body.classList.add('print-mode-sop')
  const cleanup = () => {
    document.body.classList.remove('print-mode-sop')
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.dispatchEvent(new Event(SOP_BEFORE_PRINT_EVENT))
  window.print()
}

export function schedulePengajuanPrint(
  target: 'sop',
  props: SopPdfDocumentProps,
  delayMs: number = PRINT_DELAY_MS,
  options?: SopPdfPrintOptions,
): Promise<void> {
  if (target !== 'sop') {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      printSopPdfDocument(props, options).then(resolve, reject)
    }, delayMs)
  })
}

/** Cetak dokumen SOP PDF-native (header + langkah) memakai `@react-pdf/renderer`. */
export function scheduleSopDocumentPrint(
  props: SopPdfDocumentProps,
  delayMs: number = PRINT_DELAY_MS,
  options?: SopPdfPrintOptions,
): Promise<void> {
  return schedulePengajuanPrint('sop', props, delayMs, options)
}

/** @deprecated Gunakan triggerSopPrint */
export function triggerPengajuanPrint(target: PengajuanPrintTarget): void {
  if (target === 'sop') {
    triggerSopPrint()
  }
}
