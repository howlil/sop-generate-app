/**
 * API Services - Unified Export
 * All API services matching server endpoints
 * 
 * Note: Types are NOT re-exported here.
 * Import types directly from @/types/<module>
 * 
 * Config is exported from @/config/<module>
 */

// Config (re-export for backward compatibility)
export { API_BASE_URL, getHeaders, buildUrl } from '@/config/api.config'
export {
  queryClientConfig,
  DEFAULT_STALE_TIME,
  DEFAULT_RETRY,
  DEFAULT_REFETCH_ON_WINDOW_FOCUS,
  DEFAULT_MUTATION_RETRY,
} from '@/config/query.config'

// Core
export { apiClient, ApiError } from './api'

// Auth & Users
export { authApi } from './auth.api'
export { usersApi } from './users.api'

// Domain Modules
export { opdApi } from './opd.api'
export { peraturanApi } from './peraturan.api'
export { sopApi } from './sop.api'
export { evaluasiApi } from './evaluasi.api'
export { tteApi } from './tte.api'
export { timPenyusunApi } from './tim-penyusun.api'
export { timEvaluasiApi } from './tim-evaluasi.api'
export { auditApi } from './audit.api'
