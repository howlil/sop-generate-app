/**
 * SOP Status domain logic
 */

/**
 * Check if SOP can be edited
 * SOP can be edited if status is Draft, Sedang Disusun, or Revisi dari Tim Evaluasi
 */
export function canEditSop(status: string): boolean {
  const editableStatuses = ['Draft', 'Sedang Disusun', 'Revisi dari Tim Evaluasi']
  return editableStatuses.includes(status)
}

/**
 * Check if SOP can be signed by Kepala OPD
 * SOP can be signed if status is Siap Diverifikasi and has TTE
 */
export function canKepalaOpdSignSop(status: string, hasTTE: boolean): boolean {
  return status === 'Siap Diverifikasi' && hasTTE
}

/**
 * Check if SOP is eligible for signing (has all required conditions)
 */
export function isSopEligibleForSigning(sop: any): boolean {
  return (
    sop.status === 'Siap Diverifikasi' &&
    sop.hasTTE === true &&
    sop.detailSOP?.length > 0
  )
}
