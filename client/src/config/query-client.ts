/**
 * Query client provider untuk TanStack Query
 * Configuration and initialization
 */

import { QueryClient } from '@tanstack/react-query'
import { queryClientConfig } from '@/config/query.config'

export const queryClient = new QueryClient(queryClientConfig)
