/**
 * Domain Logic - Consolidated
 * Small domain helpers that don't need their own files
 */

// ==================== SOP Evaluasi ====================
export function isSopInEvaluasiList(sopId: string, evaluasiList: any[]): boolean {
  return evaluasiList.some((e) => e.sopId === sopId)
}

export function canSelectSOPForEvaluasi(sop: any, evaluasiList: any[]): boolean {
  return !isSopInEvaluasiList(sop.id, evaluasiList)
}

// ==================== TTE ====================
/**
 * @deprecated Use server-side PIN hashing instead
 */
export function hashPin(pin: string): string {
  return btoa(pin)
}

/**
 * @deprecated Use server-side PIN verification instead
 */
export function verifyPin(pin: string, pinHash: string): boolean {
  return hashPin(pin) === pinHash
}

// ==================== Tim Penyusun Access ====================
export function canTimPenyusunRunCoordinatorActions(role: string): boolean {
  return role === 'KOORDINATOR_TIM_PENYUSUN'
}
