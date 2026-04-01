/**
 * Tim Penyusun access control domain logic
 */

/**
 * Check if Tim Penyusun can run coordinator actions
 * Only KOORDINATOR_TIM_PENYUSUN can run these actions
 */
export function canTimPenyusunRunCoordinatorActions(peran: string): boolean {
  return peran === 'KOORDINATOR_TIM_PENYUSUN'
}
