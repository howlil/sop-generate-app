import { describe, expect, it } from 'vitest'
import { canCetakArsipPengajuan } from '../pengajuan-print'

describe('canCetakArsipPengajuan', () => {
  it('mengizinkan cetak hanya saat status SELESAI', () => {
    expect(canCetakArsipPengajuan('SELESAI')).toBe(true)
    expect(canCetakArsipPengajuan('DITANDATANGANI_PJ_PENYUSUN')).toBe(false)
    expect(canCetakArsipPengajuan(undefined)).toBe(false)
  })
})
