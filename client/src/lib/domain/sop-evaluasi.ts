/**
 * SOP Evaluasi domain logic
 */

import type { SopItem } from '@/lib/types/sop'

/**
 * Check if SOP is in evaluasi list (status: Sedang Dievaluasi or Siap Diverifikasi)
 */
export function isSopInEvaluasiList(sop: SopItem): boolean {
  return (
    sop.status === 'Sedang Dievaluasi' || sop.status === 'Siap Diverifikasi'
  )
}

/**
 * Check if SOP can be selected for evaluasi
 * SOP can be selected if status is 'Siap Dievaluasi'
 */
export function canSelectSOPForEvaluasi(sop: SopItem): boolean {
  return sop.status === 'Siap Dievaluasi'
}
