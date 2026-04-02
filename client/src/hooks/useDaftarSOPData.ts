/**
 * useDaftarSOPData Hook - TanStack Query Implementation
 */

import { useQuery } from '@tanstack/react-query'
import { sopApi } from '@/services/sop.api'
import { queryKeys } from '@/services/queryKeys'

export function useDaftarSOPData(opdId?: string) {
  return useQuery({
    queryKey: queryKeys.sopList(opdId ? { opdId } : undefined),
    queryFn: () => sopApi.findAll(opdId ? { opdId } : undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
