/**
 * Organisasi Feature Module
 * OPD and Peraturan management
 */

// Types
export type {
  OPD,
  CreateOpdDto,
  UpdateOpdDto,
  OpdWithStats,
} from './types/opd'

export type {
  Peraturan,
  CreatePeraturanDto,
  UpdatePeraturanDto,
  RiwayatVersiEntry,
  SopMengait,
} from './types/peraturan'

export type { StatusPeraturan } from '@/types/common'

// Services
export { opdApi } from './services/opd.api'
export { peraturanApi } from './services/peraturan.api'

// Hooks
export { useOpd } from './hooks/useOpd'
export { usePeraturan } from './hooks/usePeraturan'
