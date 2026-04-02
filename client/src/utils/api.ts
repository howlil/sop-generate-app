/**
 * API utilities and hooks
 * 
 * Note: Toast handling should be done at the hook level using useToast()
 * from @/utils/ui, not via wrappers. This keeps API layer pure.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions } from '@tanstack/react-query'
import { apiClient } from './api-client'

// Re-export apiClient for convenience
export { apiClient }

/**
 * @deprecated Use useToast() from @/utils/ui instead
 * This wrapper creates tight coupling between API and UI layers.
 * 
 * Instead, handle toasts in your feature hooks:
 * 
 * ```typescript
 * const { showToast } = useToast()
 * const mutation = useMutation({
 *   mutationFn: (data) => apiClient.post('/sop', data),
 *   onSuccess: () => showToast('SOP berhasil dibuat', 'success'),
 *   onError: (error) => showToast(error.message, 'error'),
 * })
 * ```
 */
export async function withToast<T>(
  fn: () => Promise<T>,
  options: { successMsg?: string; errorMsg?: string } = {}
): Promise<T> {
  console.warn('withToast is deprecated. Use useToast() hook instead.')
  return fn()
}

/**
 * @deprecated Use inline callbacks in useMutation instead
 * 
 * ```typescript
 * const { showToast } = useToast()
 * useMutation({
 *   mutationFn: createSop,
 *   onSuccess: () => showToast('Success', 'success'),
 *   onError: (error) => showToast(error.message, 'error'),
 * })
 * ```
 */
export function withMutationToast(
  successMsg: string,
  errorMsg?: string,
  options?: { onSuccess?: () => void; onError?: (error: Error) => void }
) {
  console.warn('withMutationToast is deprecated. Use inline callbacks instead.')
  return {
    onSuccess: () => {
      console.warn('withMutationToast is deprecated')
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      console.warn('withMutationToast is deprecated')
      options?.onError?.(error)
    },
  }
}

/**
 * Generic mutation hook with standard error handling
 * Use this for simple mutations without custom toast messages
 */
export function useApiMutation<TData, TError = Error, TVariables = void>(
  mutationKey: unknown[],
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationKey' | 'mutationFn'>
) {
  return useMutation({
    mutationKey,
    mutationFn,
    ...options,
  })
}
