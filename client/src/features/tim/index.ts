/**
 * Tim Feature Module
 * Team management (Tim Penyusun & Tim Evaluasi)
 */

// Types
export type {
  AnggotaTimPenyusun,
  AnggotaTimEvaluasi,
  CreateTimEvaluasiDto,
  UpdateTimEvaluasiDto,
  CreateTimPenyusunDto,
  PindahTimPenyusunDto,
  TimPenyusunFormState,
} from './types/tim'

// Type aliases for backward compatibility / alternate naming conventions
export type { AnggotaTimEvaluasi as TimEvaluasiAnggota } from './types/tim'
export type { CreateTimEvaluasiDto as CreateTimEvaluasiRequest } from './types/tim'

export type { StatusTim } from '@/types/common'

// Services
export { timPenyusunApi } from './services/tim-penyusun.api'

// Hooks
export { useTimPenyusun } from './hooks/useTimPenyusun'
export { useTimEvaluasi } from './hooks/useTimEvaluasi'
