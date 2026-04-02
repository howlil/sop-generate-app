/**
 * Query Configuration
 * TanStack Query default options
 */

import type { QueryClientConfig } from '@tanstack/react-query'

export const DEFAULT_STALE_TIME = 1000 * 60 * 5 // 5 minutes
export const DEFAULT_RETRY = 1
export const DEFAULT_REFETCH_ON_WINDOW_FOCUS = false
export const DEFAULT_MUTATION_RETRY = 0

/**
 * Default QueryClient configuration
 */
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      retry: DEFAULT_RETRY,
      refetchOnWindowFocus: DEFAULT_REFETCH_ON_WINDOW_FOCUS,
    },
    mutations: {
      retry: DEFAULT_MUTATION_RETRY,
    },
  },
}
