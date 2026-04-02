/**
 * Audit API service
 * Matches server: AuditController
 */

import { apiClient } from '../utils/api-client'
import type { LogEditSOP, BagianSOP, AuditQueryParams } from '@/types/audit'

export const auditApi = {
  findBySopDetail: (
    sopDetailId: string,
    params?: { bagian?: BagianSOP; skip?: number; take?: number },
  ) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return apiClient.get<LogEditSOP[]>(`/audit/detail-sop/${sopDetailId}${query}`)
  },

  findAll: (params?: AuditQueryParams) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return apiClient.get<LogEditSOP[]>(`/audit${query}`)
  },
}
