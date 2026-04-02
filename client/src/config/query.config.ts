/**
 * Query Configuration
 * TanStack Query default options
 */

import type { QueryClientConfig } from '@tanstack/react-query'
import type { ApiError } from '@/utils/api-client'

export const DEFAULT_STALE_TIME = 1000 * 60 * 5 // 5 minutes
export const DEFAULT_REFETCH_ON_WINDOW_FOCUS = false
export const DEFAULT_MUTATION_RETRY = 0

/**
 * Default retry logic for queries
 * - 4xx errors (client errors): Don't retry
 * - 5xx errors (server errors): Retry up to 2 times
 */
function getDefaultRetry(failureCount: number, error: ApiError): boolean {
  // Don't retry on 4xx errors (bad request, unauthorized, etc.)
  if (error.status >= 400 && error.status < 500) {
    return false
  }
  // Retry up to 2 times on 5xx errors or network errors
  return failureCount < 2
}

/**
 * Default QueryClient configuration
 */
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      retry: getDefaultRetry,
      refetchOnWindowFocus: DEFAULT_REFETCH_ON_WINDOW_FOCUS,
    },
    mutations: {
      retry: DEFAULT_MUTATION_RETRY,
    },
  },
}
