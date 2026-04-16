/**
 * Audit Log types matching server schema
 * Uses shared types from @/types/common
 */

import type { BagianSOP, LogEditSOP } from "@/types/common";

// Re-export shared types from central location for backward compatibility
export type { BagianSOP, LogEditSOP };

// Feature-specific interfaces
export interface CreateLogEditSOPDto {
  sopDetailId: string
  bagian: BagianSOP
  entityId?: string
  keterangan?: string
}

export interface LogEditSOPResponse {
  data: LogEditSOP[]
  total: number
}

export interface AuditQueryParams extends Record<string, unknown> {
  bagian?: BagianSOP
  skip?: number
  take?: number
}
