/**
 * Evaluasi Feature Module
 * SOP evaluation workflow management
 */

// Types (re-export from central types + feature-specific)
export type {
  PengajuanEvaluasi,
  CreatePengajuanEvaluasiDto,
  UpdatePengajuanEvaluasiDto,
  NilaiEvaluasi,
  CreateNilaiEvaluasiDto,
  UpdateNilaiEvaluasiDto,
  LogNilaiEvaluasi,
  BatchListSopItem,
  StatusHasilEvaluasiForm,
} from './types/evaluasi'

// Type aliases for backward compatibility
export type RiwayatEvaluasiSOPItem = NilaiEvaluasi
export type RiwayatEvaluasiOPDItem = PengajuanEvaluasi

// Export useEvaluasiSubmit types
export type { EvaluasiBatchSubmitError, EvaluasiSubmitItem } from './hooks/useEvaluasiSubmit'

// Re-export shared types from central location
export type {
  JenisPengajuanEvaluasi,
  StatusPengajuanEvaluasi,
  StatusHasilEvaluasi,
} from '@/types/common'

export { STATUS_HASIL_EVALUASI } from './hooks/useEvaluasi'

// Services (only depend on types)
export { evaluasiApi } from './services/evaluasi.api'
export { timEvaluasiApi } from './services/tim-evaluasi.api'

// Hooks (depend on services and types)
// Query hooks
export { useEvaluasi, useRekapEvaluasi } from './hooks/useEvaluasi'
export { useEvaluasiDetail, usePengajuanEvaluasiDetail } from './hooks/useEvaluasi'
export { useEvaluasiDraft } from './hooks/useEvaluasiDraft'
export { useEvaluasiSubmit } from './hooks/useEvaluasiSubmit'

// Business logic helpers
export { getStatusSopAfterEvaluasi, isFormEvaluasiSopComplete } from './hooks/useEvaluasi'
export { getEvaluasiDraft } from './hooks/useEvaluasiDraft'

// Components (depend on everything - export selectively)
export { RiwayatCardList } from './components/RiwayatCardList'
export { SkorRatingPicker } from './components/SkorRatingPicker'
export { StatusHasilEvaluasiPicker } from './components/StatusHasilEvaluasiPicker'
