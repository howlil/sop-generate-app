/**
 * Legacy evaluasi data - deprecated
 * Evaluasi data is now handled by backend API
 * This file is for backward compatibility only
 */

/**
 * Get last evaluated by data
 * @deprecated Use API instead
 */
export function getLastEvaluatedByInitial(): Record<string, { date: string; evaluatorName: string }> {
  console.warn('getLastEvaluatedByInitial is deprecated - use API instead')
  return {}
}

/**
 * Get riwayat evaluasi SOP
 * @deprecated Use API instead
 */
export function getRiwayatEvaluasiSop(): Record<string, any[]> {
  console.warn('getRiwayatEvaluasiSop is deprecated - use API instead')
  return {}
}

/**
 * Get riwayat evaluasi OPD
 * @deprecated Use API instead
 */
export function getRiwayatEvaluasiOpd(): Record<string, any[]> {
  console.warn('getRiwayatEvaluasiOpd is deprecated - use API instead')
  return {}
}

/**
 * Get OPD ID by name
 * @deprecated Use API instead
 */
export function getOpdIdByName(name: string): string | null {
  console.warn('getOpdIdByName is deprecated - use API instead')
  return null
}
