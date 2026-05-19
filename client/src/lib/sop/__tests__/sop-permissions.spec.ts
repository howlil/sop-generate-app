import { describe, expect, it } from 'vitest'
import { isSopEligibleForSigning } from '../sop-permissions'

describe('sop-permissions', () => {
  it('should_only_allow_kepala_opd_signing_after_pj_penyusun_ba_signature', () => {
    expect(isSopEligibleForSigning({ status: 'SIAP_DIVERIFIKASI' })).toBe(false)
    expect(
      isSopEligibleForSigning({
        status: 'DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI',
      }),
    ).toBe(true)
  })
})
