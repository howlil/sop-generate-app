/**
 * Legacy Tim Penyusun store - deprecated
 * Tim Penyusun data is now handled by backend API
 * This file is for backward compatibility only
 */

import type { TimPenyusun } from '@/lib/types/tim'

const STORAGE_KEY = 'tim_penyusun_store'

/**
 * Add Tim Penyusun
 * @deprecated Use API instead
 */
export function addTimPenyusun(data: Omit<TimPenyusun, 'id' | 'createdAt' | 'updatedAt'>) {
  console.log('Adding Tim Penyusun:', data)
  // Legacy stub - in production, this should call API
}

/**
 * Update Tim Penyusun
 * @deprecated Use API instead
 */
export function updateTimPenyusun(id: string, data: Partial<TimPenyusun>) {
  console.log('Updating Tim Penyusun:', id, data)
  // Legacy stub - in production, this should call API
}

/**
 * Remove Tim Penyusun
 * @deprecated Use API instead
 */
export function removeTimPenyusun(id: string) {
  console.log('Removing Tim Penyusun:', id)
  // Legacy stub - in production, this should call API
}
