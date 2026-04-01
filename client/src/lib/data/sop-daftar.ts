/**
 * Legacy SOP Daftar data - deprecated
 * SOP data is now handled by backend API via useSop hook
 * This file is for backward compatibility only
 */

import type { SopItem } from '@/lib/types/sop'

/** Mock SOP data for development */
const MOCK_SOP_LIST: SopItem[] = []

/**
 * Get initial SOP daftar list
 * @deprecated Use useSop hook instead
 */
export function getInitialSopDaftarList(): SopItem[] {
  return MOCK_SOP_LIST
}

/**
 * Get SOP daftar by OPD ID
 * @deprecated Use useSop hook with opdId filter instead
 */
export function getSopDaftarByOpdId(opdId: string): SopItem[] {
  console.warn('getSopDaftarByOpdId is deprecated - use useSop hook instead')
  return MOCK_SOP_LIST.filter((sop) => sop.opdId === opdId)
}

/**
 * Get peraturan daftar options
 * @deprecated Use usePeraturan hook instead
 */
export function getPeraturanDaftarOptions(): { value: string; label: string }[] {
  console.warn('getPeraturanDaftarOptions is deprecated - use usePeraturan hook instead')
  return []
}
