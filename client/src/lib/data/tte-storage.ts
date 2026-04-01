/**
 * Legacy TTE storage - deprecated
 * TTE is now handled by backend API
 * This file is for backward compatibility only
 */

import type { TTERole } from '@/types/tte'

export interface TTEProfile {
  nip: string
  nama: string
  role: TTERole
  isActive: boolean
  createdAt?: string
}

/**
 * Get TTE profile - returns null as TTE is now API-based
 * @deprecated Use API instead
 */
export function getTTEProfile(role: TTERole): TTEProfile | null {
  // Legacy stub - return null to indicate no local profile
  // Backend now handles TTE profile
  return null
}

/**
 * Verify TTE email token - deprecated
 * @deprecated Use API endpoint /api/v1/tte/verify instead
 */
export function verifyTTEEmail(token: string): string | null {
  console.warn('verifyTTEEmail is deprecated - use API instead')
  return null
}

/**
 * Get TTE signature by ID - deprecated
 * @deprecated Use API endpoint /api/v1/tte/signatures/:id instead
 */
export function getTTESignatureById(id: string): any | null {
  console.warn('getTTESignatureById is deprecated - use API instead')
  return null
}

/**
 * Get TTE audit log - deprecated
 * @deprecated Use API endpoint /api/v1/tte/audit-log instead
 */
export function getTTEAuditLog(): any[] {
  console.warn('getTTEAuditLog is deprecated - use API instead')
  return []
}
