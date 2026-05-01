/**
 * useMutationWithToast - Factory hook for CRUD mutations with toast notifications
 *
 * Eliminates duplicated boilerplate across all feature hooks where every mutation
 * follows the same pattern: mutate → invalidate query → show toast on success/error.
 *
 * @example
 * ```ts
 * const { mutateAsync: create, isPending: isCreating } = useMutationWithToast({
 *   mutationFn: (payload) => sopApi.create(payload),
 *   invalidateKeys: [queryKeys.sop],
 *   successMessage: 'SOP berhasil dibuat',
 *   errorMessagePrefix: 'Gagal membuat SOP',
 * })
 * ```
 */

import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useToast, showErrorMessages } from "@/hooks/useToast";

interface UseMutationWithToastOptions<TData = unknown, TVariables = unknown> {
  /** The mutation function to execute */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Query keys to invalidate on success (optional for mutations that don't need cache invalidation) */
  invalidateKeys?: readonly QueryKey[];
  /** Toast message shown on success */
  successMessage: string;
  /** Use detailed error messages (showErrorMessages) instead of simple toast */
  useDetailedErrors?: boolean;
  /** Prefix for error toast message (used when useDetailedErrors is false) */
  errorMessagePrefix?: string;
  /** Optional additional onSuccess callback */
  onSuccess?: (data: TData, variables: TVariables) => void;
  /** Optional additional onError callback */
  onError?: (error: Error, variables: TVariables) => void;
}

export function useMutationWithToast<TData = unknown, TVariables = unknown>(
  options: UseMutationWithToastOptions<TData, TVariables>,
) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate specified query keys if provided
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
      showToast(options.successMessage, "success");
      options.onSuccess?.(data, variables);
    },
    onError: (error: Error, variables) => {
      // Always use showErrorMessages for consistent error handling
      // This handles both ApiError (with errors array) and regular errors
      showErrorMessages(
        error,
        options.errorMessagePrefix || "Terjadi kesalahan",
      );
      options.onError?.(error, variables);
    },
  });
}
