/**
 * Audit Feature Module
 * Audit trail and logging
 */

// Types
export type {
  LogEditSOP,
  LogEditSOPResponse,
  AuditQueryParams,
} from './types/audit'

// Type aliases for backward compatibility
export type { LogEditSOP as LogAudit } from './types/audit'
export type { AuditQueryParams as AuditFilters } from './types/audit'

export type { BagianSOP } from '@/types/common'

// Services
export { auditApi } from './services/audit.api'

// Hooks
export { useAuditBySopDetail, useAuditAll } from './hooks/useAudit'
export { useAuditBySopDetail as useAudit } from './hooks/useAudit'
