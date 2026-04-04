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
} from './types/evaluasi'

export type { StatusHasilEvaluasiForm } from './hooks/useEvaluasi'

// Type aliases for backward compatibility
export type { NilaiEvaluasi as RiwayatEvaluasiSOPItem } from './types/evaluasi'
export type { PengajuanEvaluasi as RiwayatEvaluasiOPDItem } from './types/evaluasi'

// Export useEvaluasiSubmit types
export type { EvaluasiBatchSubmitError, EvaluasiSubmitItem } from './hooks/useEvaluasiSubmit'

// Re-export shared types from central location
export type {
  JenisPengajuanEvaluasi,
  StatusPengajuanEvaluasi,
  StatusHasilEvaluasi,
  RekapEvaluasi,
  RekapDetail,
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
export type { UseEvaluasiDraftReturn } from './hooks/useEvaluasiDraft'
export { usePengajuanEvaluasiAktif } from './hooks/usePengajuanEvaluasiAktif'
export type { UsePengajuanEvaluasiAktifReturn } from './hooks/usePengajuanEvaluasiAktif'
export { useEvaluasiSubmit } from './hooks/useEvaluasiSubmit'
export { useEvaluasiSopByOpd, useRiwayatEvaluasiSop, useRiwayatEvaluasiOpd } from './hooks/useEvaluasiSopByOpd'
export type { RiwayatEvaluasiEntry } from './hooks/useEvaluasiSopByOpd'

// Business logic helpers
export { getStatusSopAfterEvaluasi, isFormEvaluasiSopComplete } from './hooks/useEvaluasi'

// Components (depend on everything - export selectively)
export { RiwayatCardList } from './components/RiwayatCardList'
export { SkorRatingPicker } from './components/SkorRatingPicker'
export { StatusHasilEvaluasiPicker } from './components/StatusHasilEvaluasiPicker'
