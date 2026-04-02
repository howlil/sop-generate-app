/**
 * SOP Status Domain Logic
 */

import type { StatusSOP } from '@/services/sop.api'

export function canEditSop(status: StatusSOP): boolean {
  return status === 'DRAFT' || status === 'REVISI_DARI_TIM_EVALUASI'
}

export function canKepalaOpdSignSop(
  status: StatusSOP,
  batchList: any[],
  opdName: string,
  sopId: string,
  sopNomor: string
): boolean {
  // SOP can be signed if status is "DITANDATANGANI_KOORDINATOR"
  return status === 'DITANDATANGANI_KOORDINATOR'
}

export function isSopEligibleForSigning(sop: any, batchList: any[]): boolean {
  return sop.status === 'DITANDATANGANI_KOORDINATOR'
}
