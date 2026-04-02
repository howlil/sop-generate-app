/**
 * @deprecated API toast handling utilities
 * 
 * This file is deprecated. Handle toast notifications directly in your feature hooks
 * using useToast() from @/utils/ui.
 * 
 * ## Migration Guide
 * 
 * ### Before (withToast wrapper):
 * ```typescript
 * import { withToast } from '@/utils/handleApi'
 * 
 * const createSop = async (data) => {
 *   return withToast(() => apiClient.post('/sop', data), { 
 *     successMsg: 'SOP berhasil dibuat' 
 *   })
 * }
 * ```
 * 
 * ### After (direct toast in hook):
 * ```typescript
 * import { useToast } from '@/utils/ui'
 * import { apiClient } from '@/utils/api-client'
 * 
 * export function useCreateSop() {
 *   const { showToast } = useToast()
 *   
 *   return useMutation({
 *     mutationFn: (data) => apiClient.post('/sop', data),
 *     onSuccess: () => showToast('SOP berhasil dibuat', 'success'),
 *     onError: (error) => showToast(error.message, 'error'),
 *   })
 * }
 * ```
 * 
 * ### Before (withMutationToast):
 * ```typescript
 * import { withMutationToast } from '@/utils/handleApi'
 * 
 * useMutation({
 *   mutationFn: createSop,
 *   ...withMutationToast('SOP berhasil dibuat', 'Gagal membuat SOP')
 * })
 * ```
 * 
 * ### After (inline callbacks):
 * ```typescript
 * import { useToast } from '@/utils/ui'
 * 
 * const { showToast } = useToast()
 * 
 * useMutation({
 *   mutationFn: createSop,
 *   onSuccess: () => showToast('SOP berhasil dibuat', 'success'),
 *   onError: (error) => showToast(error.message, 'error'),
 * })
 * ```
 * 
 * ## Why Deprecate?
 * 
 * 1. **Mixed Concerns**: handleApi.ts bridges API and UI layers, creating tight coupling
 * 2. **Inconsistent Patterns**: Three different ways to show toasts (wrapper, callbacks, manual)
 * 3. **Direct Store Access**: Uses showToast from store instead of useToast hook
 * 4. **Harder to Test**: Wrapper functions add indirection
 * 
 * ## Benefits of New Pattern
 * 
 * 1. **Clear Separation**: API layer (api-client) and UI layer (useToast) are separate
 * 2. **Consistent**: One way to show toasts - use useToast() hook
 * 3. **Testable**: Hooks are easier to test than wrappers
 * 4. **Flexible**: Can customize toast behavior per use case
 */

import { showToast } from '@/stores/uiStore'
import type { ToastType } from '@/stores/uiStore'

interface ApiHandlerOptions {
  successMsg?: string
  errorMsg?: string
  successType?: ToastType
  showErrorToast?: boolean
  showSuccessToast?: boolean
}

/**
 * @deprecated Use useToast() from @/utils/ui in your hooks instead
 */
export async function withToast<T>(
  fn: () => Promise<T>,
  options: ApiHandlerOptions = {}
): Promise<T> {
  console.warn('withToast is deprecated. Use useToast() hook in your feature hooks instead.')
  
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
    if (!showErrorToast) {
      throw error
    }

    const message = errorMsg || (error instanceof Error ? error.message : 'Terjadi kesalahan')
    showToast(message, 'error')
    throw error
  }
}

/**
 * @deprecated Use inline callbacks in useMutation with useToast() hook
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
  console.warn('withMutationToast is deprecated. Use inline callbacks with useToast() instead.')
  
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
