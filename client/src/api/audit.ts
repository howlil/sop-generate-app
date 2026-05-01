import { apiClient, buildQueryString } from "@/lib/api/api-client";
import type { LogEditSOP } from "@/types/dto/audit.dto";
import type { AuditQueryParams } from "@/types/dto/audit.dto";

export const auditApi = {
  findBySopDetail: (
    sopDetailId: string,
    params?: AuditQueryParams,
  ) => apiClient.get<LogEditSOP[]>(`/audit/detail-sop/${sopDetailId}${buildQueryString(params)}`),

  findAll: (params?: AuditQueryParams) =>
    apiClient.get<LogEditSOP[]>(`/audit${buildQueryString(params)}`),
};

/**
 * useAudit hook dengan TanStack Query
 * Matches server: AuditService endpoints
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/config/query-keys'
import { STALE_TIME } from '@/utils/constants'

/**
 * Hook untuk get audit logs per SOP detail (AUD-03)
 * Accessible by Tim Penyusun for their own SOP
 */
export function useAuditBySopDetail(
  sopDetailId: string,
  params?: AuditQueryParams,
) {
  return useQuery({
    queryKey: queryKeys.auditBySopDetail(sopDetailId),
    queryFn: () => auditApi.findBySopDetail(sopDetailId, params),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.LONG,
  })
}

/**
 * Hook untuk get all audit logs (AUD-04)
 * Biro Organisasi only
 */
export function useAuditAll(params?: AuditQueryParams) {
  return useQuery({
    queryKey: queryKeys.auditAll(params),
    queryFn: () => auditApi.findAll(params),
    staleTime: STALE_TIME.LONG,
  })
}
