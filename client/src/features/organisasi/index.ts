/**
 * Organisasi Feature Module
 * OPD and Peraturan management
 */

// Types
export type {
  OPD,
  OpdResponse,
  CreateOpdDto,
  UpdateOpdDto,
  OpdWithStats,
} from './types/opd'

export type {
  Peraturan,
  PeraturanResponse,
  CreatePeraturanDto,
  UpdatePeraturanDto,
  RiwayatVersiEntry,
  SopMengait,
} from './types/peraturan'

// Type aliases for request naming convention
export type { CreatePeraturanDto as CreatePeraturanRequest } from './types/peraturan'
export type { UpdatePeraturanDto as UpdatePeraturanRequest } from './types/peraturan'
export type { CreateOpdDto as CreateOpdRequest } from './types/opd'
export type { UpdateOpdDto as UpdateOpdRequest } from './types/opd'

export type { StatusPeraturan } from '@/types/common'

// Services
export { opdApi } from './services/opd.api'
export { peraturanApi } from './services/peraturan.api'

// Hooks
export { useOpd } from './hooks/useOpd'
export { usePeraturan, usePeraturanRiwayat } from './hooks/usePeraturan'
