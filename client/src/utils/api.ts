/**
 * API utilities and hooks
 *
 * Note: Toast handling should be done at the hook level using useToast()
 * from @/utils/ui, not via wrappers. This keeps API layer pure.
 */

import { useMutation } from '@tanstack/react-query'
import type { UseMutationOptions } from '@tanstack/react-query'
import { apiClient } from './api-client'

// Re-export apiClient for convenience
export { apiClient }

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
