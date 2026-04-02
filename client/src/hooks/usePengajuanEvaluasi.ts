/**
 * usePengajuanEvaluasi Hook - TanStack Query Implementation
 */

import { useQuery } from '@tanstack/react-query'
import { evaluasiApi } from '@/services/evaluasi.api'
import { queryKeys } from '@/services/queryKeys'

const PENGAJUAN_STALE_TIME = 3 * 60 * 1000 // 3 minutes

export function usePengajuanEvaluasiList() {
  return useQuery({
    queryKey: queryKeys.evaluasiList(),
    queryFn: () => evaluasiApi.findAll(),
    staleTime: PENGAJUAN_STALE_TIME,
  })
}
