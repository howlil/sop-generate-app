/**
 * TTE types - stub
 */

export type TTERole = 'KEPALA_OPD' | 'BIRO_ORGANISASI' | 'KOORDINATOR_TIM_PENYUSUN'

export interface TTESignature {
  id: string
  userId: string
  peran: TTERole
  sopDetailId?: string
  pengajuanEvaluasiId?: string
  signedAt: string
}

export interface TTESignaturePayload {
  peran: TTERole
  sopDetailId?: string
  pengajuanEvaluasiId?: string
}
