import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  canCetakArsipPengajuan,
  canCetakBeritaAcaraPengajuan,
  canCetakSopArsipPengajuan,
  PRINT_DELAY_MS,
  scheduleSopDocumentPrint,
  SOP_BEFORE_PRINT_EVENT,
  triggerPengajuanPrint,
} from '../pengajuan-print'

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

describe('triggerPengajuanPrint', () => {
  beforeEach(() => {
    vi.spyOn(window, 'print').mockImplementation(() => {})
    document.body.className = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.className = ''
  })

  it('menambahkan class print-mode-sop saat target sop', () => {
    triggerPengajuanPrint('sop')
    expect(document.body.classList.contains('print-mode-sop')).toBe(true)
    expect(window.print).toHaveBeenCalledOnce()
  })

  it('mendispatch SOP_BEFORE_PRINT_EVENT saat target sop atau sop-all', () => {
    const handler = vi.fn()
    window.addEventListener(SOP_BEFORE_PRINT_EVENT, handler)
    triggerPengajuanPrint('sop')
    expect(handler).toHaveBeenCalledOnce()
    handler.mockClear()
    triggerPengajuanPrint('sop-all')
    expect(handler).toHaveBeenCalledOnce()
    window.removeEventListener(SOP_BEFORE_PRINT_EVENT, handler)
  })

  it('tidak mendispatch SOP_BEFORE_PRINT_EVENT saat target ba', () => {
    const handler = vi.fn()
    window.addEventListener(SOP_BEFORE_PRINT_EVENT, handler)
    triggerPengajuanPrint('ba')
    expect(handler).not.toHaveBeenCalled()
    window.removeEventListener(SOP_BEFORE_PRINT_EVENT, handler)
  })
})

describe('scheduleSopDocumentPrint', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(window, 'print').mockImplementation(() => {})
    document.body.className = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.className = ''
  })

  it('menjadwalkan cetak SOP dengan class print-mode-sop pada body', () => {
    scheduleSopDocumentPrint()
    expect(document.body.classList.contains('print-mode-sop')).toBe(false)
    vi.advanceTimersByTime(PRINT_DELAY_MS)
    expect(document.body.classList.contains('print-mode-sop')).toBe(true)
    expect(window.print).toHaveBeenCalledOnce()
  })
})
