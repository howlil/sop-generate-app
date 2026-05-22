import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { printSopPdfDocument } from '../print-sop-pdf'
import {
  canCetakArsipPengajuan,
  canCetakBeritaAcaraPengajuan,
  canCetakSopArsipPengajuan,
  PRINT_DELAY_MS,
  scheduleSopDocumentPrint,
  SOP_BEFORE_PRINT_EVENT,
  triggerPengajuanPrint,
  triggerSopPrint,
} from '../pengajuan-print'

vi.mock('../print-sop-pdf', () => ({
  printSopPdfDocument: vi.fn(() => Promise.resolve()),
}))

const sampleSopPrintProps = {
  name: 'SOP Pengujian',
  number: '001/SOP',
}

describe('canCetakBeritaAcaraPengajuan', () => {
  it('mengizinkan cetak BA setelah kedua PJ menandatangani', () => {
    expect(canCetakBeritaAcaraPengajuan('DITANDATANGANI_PJ_PENYUSUN')).toBe(true)
    expect(canCetakBeritaAcaraPengajuan('SELESAI')).toBe(true)
    expect(canCetakBeritaAcaraPengajuan('DIVERIFIKASI_PJ_EVALUATOR')).toBe(false)
    expect(canCetakBeritaAcaraPengajuan(undefined)).toBe(false)
  })
})

describe('canCetakSopArsipPengajuan', () => {
  it('mengizinkan cetak SOP arsip hanya saat status SELESAI', () => {
    expect(canCetakSopArsipPengajuan('SELESAI')).toBe(true)
    expect(canCetakSopArsipPengajuan('DITANDATANGANI_PJ_PENYUSUN')).toBe(false)
    expect(canCetakSopArsipPengajuan(undefined)).toBe(false)
  })
})

describe('canCetakArsipPengajuan', () => {
  it('mengizinkan cetak hanya saat status SELESAI', () => {
    expect(canCetakArsipPengajuan('SELESAI')).toBe(true)
    expect(canCetakArsipPengajuan('DITANDATANGANI_PJ_PENYUSUN')).toBe(false)
    expect(canCetakArsipPengajuan(undefined)).toBe(false)
  })
})

describe('triggerSopPrint', () => {
  beforeEach(() => {
    vi.spyOn(window, 'print').mockImplementation(() => {})
    document.body.className = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.className = ''
  })

  it('menambahkan class print-mode-sop', () => {
    triggerSopPrint()
    expect(document.body.classList.contains('print-mode-sop')).toBe(true)
    expect(window.print).toHaveBeenCalledOnce()
  })

  it('mendispatch SOP_BEFORE_PRINT_EVENT saat cetak SOP', () => {
    const handler = vi.fn()
    window.addEventListener(SOP_BEFORE_PRINT_EVENT, handler)
    triggerSopPrint()
    expect(handler).toHaveBeenCalledOnce()
    window.removeEventListener(SOP_BEFORE_PRINT_EVENT, handler)
  })
})

describe('triggerPengajuanPrint', () => {
  beforeEach(() => {
    vi.spyOn(window, 'print').mockImplementation(() => {})
    document.body.className = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.className = ''
  })

  it('hanya memicu cetak browser untuk target sop', () => {
    triggerPengajuanPrint('sop')
    expect(document.body.classList.contains('print-mode-sop')).toBe(true)
    expect(window.print).toHaveBeenCalledOnce()
  })

  it('tidak memicu cetak browser untuk target ba', () => {
    triggerPengajuanPrint('ba')
    expect(window.print).not.toHaveBeenCalled()
  })
})

describe('scheduleSopDocumentPrint', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(window, 'print').mockImplementation(() => {})
    vi.mocked(printSopPdfDocument).mockClear()
    document.body.className = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.className = ''
  })

  it('menjadwalkan cetak SOP lewat generator PDF', async () => {
    const promise = scheduleSopDocumentPrint(sampleSopPrintProps)
    expect(printSopPdfDocument).not.toHaveBeenCalled()
    vi.advanceTimersByTime(PRINT_DELAY_MS)
    await promise
    expect(printSopPdfDocument).toHaveBeenCalledWith(sampleSopPrintProps, undefined)
    expect(window.print).not.toHaveBeenCalled()
  })
})
