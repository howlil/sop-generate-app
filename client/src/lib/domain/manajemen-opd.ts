/**
 * Manajemen OPD domain logic
 */

/**
 * Check if OPD has related data (cannot be deleted if true)
 */
export function hasRelasiData(opdId: string): boolean {
  // Legacy stub - in production, this should check API
  return false
}

/**
 * Check if Kepala OPD can be deleted
 */
export function canDeleteKepala(kepalaId: string): boolean {
  // Legacy stub - in production, this should check API
  return true
}
