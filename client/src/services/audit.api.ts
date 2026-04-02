/**
 * Audit Log API service
 * Matches server: AuditController
 */

import { apiClient } from './api'
import type { LogEditSOP, BagianSOP } from '../types/audit'

export type { LogEditSOP, BagianSOP }

export interface AuditQueryParams {
  bagian?: BagianSOP
  skip?: number
  take?: number
}

export const auditApi = {
  /**
   * AUD-03: Get audit logs for a specific SOP detail
   * Accessible by Tim Penyusun for their own SOP
   */
  findBySopDetail: (
    sopDetailId: string,
    params?: { bagian?: BagianSOP; skip?: number; take?: number },
  ) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return apiClient.get<LogEditSOP[]>(`/audit/detail-sop/${sopDetailId}${query}`)
  },

  /**
   * AUD-04: Get all audit logs (Biro Organisasi only)
   */
  findAll: (params?: AuditQueryParams) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return apiClient.get<LogEditSOP[]>(`/audit${query}`)
  },
}
