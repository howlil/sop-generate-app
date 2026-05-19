import type { StatusSOP } from '@/types/dto/sop.dto'
import { ROLES } from '@/utils/constants'

export function canEditSop(status: StatusSOP): boolean {
  return (
    status === 'DRAFT' ||
    status === 'SEDANG_DISUSUN' ||
    status === 'REVISI_DARI_EVALUATOR'
  )
}

export function canKepalaOpdSignSop(status: string): boolean {
  return status === 'DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI'
}

export function isSopEligibleForSigning(sop: { status: string }): boolean {
  return sop.status === 'DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI'
}

export function canPjPenyusunRunCoordinatorActions(role: string): boolean {
  return role === ROLES.PJ_PENYUSUN
}

export function canBuatVersiBaru(row: {
  canBuatVersiBaru?: boolean
}): boolean {
  return row.canBuatVersiBaru === true
}

export function canHapusVersiDraft(
  status: StatusSOP,
  canHapusDraft?: boolean,
): boolean {
  return status === 'DRAFT' && canHapusDraft === true
}
