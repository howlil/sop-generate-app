import { describe, expect, it } from 'vitest'
import {
  canBuatVersiBaruFromRow,
  getBuatVersiBaruBlockingReason,
  isRevisiDariBerlaku,
} from '../sop-version-domain'

describe('sop-version-domain', () => {
  it('should_detect_revisi_dari_berlaku', () => {
    expect(isRevisiDariBerlaku('detail-1')).toBe(true)
    expect(isRevisiDariBerlaku(null)).toBe(false)
  })

  it('should_allow_buat_versi_when_flag_true', () => {
    expect(canBuatVersiBaruFromRow({ canBuatVersiBaru: true })).toBe(true)
    expect(canBuatVersiBaruFromRow({ canBuatVersiBaru: false })).toBe(false)
  })

  it('should_block_buat_versi_when_revisi_in_flight', () => {
    const reason = getBuatVersiBaruBlockingReason({
      id: 'sop-1',
      opdId: 'opd-1',
      detailSopId: 'det-2',
      judul: 'SOP',
      nomorSop: '001',
      pembuat: null,
      terakhirDiedit: { nama: null, waktu: null },
      status: 'SEDANG_DIEVALUASI',
      statusLabel: 'Sedang dievaluasi',
      peraturanId: null,
      terakhirDiperbarui: null,
      versiBerlaku: {
        detailSopId: 'det-1',
        versi: 1,
        nomorSop: '001-V1',
        status: 'BERLAKU',
        statusLabel: 'Berlaku',
      },
      canBuatVersiBaru: false,
    })
    expect(reason).toContain('revisi')
  })
})
