/**
 * Legacy SOP Detail data - deprecated
 * SOP detail is now handled by backend API
 * This file is for backward compatibility only
 */

import type { SopDetail, Sop, LangkahSop, Pelaksana, LampiranTeks } from '@/types/sop'

/**
 * Get SOP detail by ID
 * @deprecated Use API instead
 */
export function getSopDetailById(id: string): SopDetail | null {
  console.warn('getSopDetailById is deprecated - use API instead')
  return null
}

/**
 * Get SOP by ID
 * @deprecated Use API instead
 */
export function getSopById(id: string): Sop | null {
  console.warn('getSopById is deprecated - use API instead')
  return null
}

/**
 * Get langkah SOP by detail ID
 * @deprecated Use API instead
 */
export function getLangkahByDetailId(detailId: string): LangkahSop[] {
  console.warn('getLangkahByDetailId is deprecated - use API instead')
  return []
}

/**
 * Get pelaksana by OPD ID
 * @deprecated Use API instead
 */
export function getPelaksanaByOpdId(opdId: string): Pelaksana[] {
  console.warn('getPelaksanaByOpdId is deprecated - use API instead')
  return []
}

/**
 * Get lampiran teks by detail ID
 * @deprecated Use API instead
 */
export function getLampiranTeksByDetailId(detailId: string): LampiranTeks[] {
  console.warn('getLampiranTeksByDetailId is deprecated - use API instead')
  return []
}

/**
 * Get related SOP options
 * @deprecated Use API instead
 */
export function getRelatedSopOptions(): { value: string; label: string }[] {
  console.warn('getRelatedSopOptions is deprecated - use API instead')
  return []
}

/**
 * Get related Peraturan options
 * @deprecated Use usePeraturan hook instead
 */
export function getRelatedPeraturanOptions(): { value: string; label: string }[] {
  console.warn('getRelatedPeraturanOptions is deprecated - use API instead')
  return []
}

/**
 * Get related POS options
 * @deprecated Use API instead
 */
export function getRelatedPosOptions(): { value: string; label: string }[] {
  console.warn('getRelatedPosOptions is deprecated - use API instead')
  return []
}
