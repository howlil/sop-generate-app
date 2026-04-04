/**
 * useAudit hook dengan TanStack Query
 * Matches server: AuditService endpoints
 */

import { useQuery } from '@tanstack/react-query'
import { auditApi } from '../services/audit.api'
import { queryKeys } from '@/utils/query-keys'
import type { BagianSOP } from '@/types/common'

/**
 * Hook untuk get audit logs per SOP detail (AUD-03)
 * Accessible by Tim Penyusun for their own SOP
 */
export function useAuditBySopDetail(
  sopDetailId: string,
  params?: { bagian?: BagianSOP; skip?: number; take?: number },
) {
  return useQuery({
    queryKey: queryKeys.auditBySopDetail(sopDetailId),
    queryFn: () => auditApi.findBySopDetail(sopDetailId, params),
    enabled: !!sopDetailId,
  })
}

/**
 * Hook untuk get all audit logs (AUD-04)
 * Biro Organisasi only
 */
export function useAuditAll(params?: { bagian?: BagianSOP; skip?: number; take?: number }) {
  return useQuery({
    queryKey: queryKeys.auditAll(params),
    queryFn: () => auditApi.findAll(params),
  })
}
