/**
 * Centralized API error handling with toast notifications
 * Best practice: Handle success/error messages at the hook level, not API layer
 */

import { showToast } from '@/stores/uiStore'
import type { ToastType } from '@/stores/uiStore'

interface ApiHandlerOptions {
  /** Success message to show toast (optional - skip if no toast needed) */
  successMsg?: string
  /** Error message override (optional - uses API error message by default) */
  errorMsg?: string
  /** Toast type for success (default: 'success') */
  successType?: ToastType
  /** Whether to show error toast (default: true) */
  showErrorToast?: boolean
  /** Whether to show success toast (default: true if successMsg provided) */
  showSuccessToast?: boolean
}

/**
 * Wraps an async API call with automatic error handling and optional toast notifications
 * 
 * @example
 * // Basic usage with success toast
 * const createSop = async (data) => {
 *   return withToast(() => api.post('/sop', data), { successMsg: 'SOP berhasil dibuat' })
 * }
 * 
 * @example
 * // Custom error message
 * const deleteSop = async (id) => {
 *   return withToast(() => api.delete(`/sop/${id}`), { 
 *     successMsg: 'SOP dihapus',
 *     errorMsg: 'Gagal menghapus SOP'
 *   })
 * }
 * 
 * @example
 * // No toast (handle manually)
 * const checkStatus = async () => {
 *   return withToast(() => api.get('/status'), { showErrorToast: false })
 * }
 */
export async function withToast<T>(
  fn: () => Promise<T>,
  options: ApiHandlerOptions = {}
): Promise<T> {
  const {
    successMsg,
    errorMsg,
    successType = 'success',
    showErrorToast = true,
    showSuccessToast = !!successMsg,
  } = options

  try {
    const result = await fn()
    
    if (showSuccessToast && successMsg) {
      showToast(successMsg, successType)
    }
    
    return result
  } catch (error) {
    // Skip error toast if disabled
    if (!showErrorToast) {
      throw error
    }

    // Use custom error message or fall back to API error message
    const message = errorMsg || (error instanceof Error ? error.message : 'Terjadi kesalahan')
    showToast(message, 'error')
    throw error
  }
}

/**
 * Specialized handler for mutations with TanStack Query
 * Provides onSuccess and onError callbacks ready to use
 * 
 * @example
 * const createMutation = useMutation({
 *   mutationFn: (data) => api.post('/sop', data),
 *   ...withMutationToast('SOP berhasil dibuat', 'Gagal membuat SOP')
 * })
 */
export function withMutationToast(
  successMsg: string,
  errorMsg?: string,
  options?: {
    onSuccess?: () => void
    onError?: (error: Error) => void
    invalidateQueries?: { queryKey: unknown }
  }
) {
  return {
    onSuccess: () => {
      showToast(successMsg, 'success')
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      showToast(errorMsg || error.message || 'Terjadi kesalahan', 'error')
      options?.onError?.(error)
    },
  }
}
