/**
 * SOP Feature Module
 * Standard Operating Procedure lifecycle management
 */

// Types (re-export from central types + feature-specific)
export type {
  Sop,
  SopDetail,
  CreateSopRequest,
  UpdateMetadataDto,
  UpdateStatusDto,
  LangkahSOP,
  CreateLangkahSOPDto,
  UpdateLangkahSOPDto,
  Pelaksana,
  CreatePelaksanaDto,
  DetailSOPPelaksana,
  CreateDetailSOPPelaksanaDto,
  LampiranTeks,
  CreateLampiranTeksDto,
  DasarHukum,
  CreateDasarHukumDto,
  SopTerkait,
  CreateSopTerkaitDto,
} from './types/sop'

export type { KomentarItem } from './types/komentar'

// Re-export evaluation types from evaluasi feature
export type {
  NilaiEvaluasi,
  LogNilaiEvaluasi,
  PengajuanEvaluasi,
} from '@/features/evaluasi/types/evaluasi'

// Re-export audit types from audit feature
export type {
  LogEditSOP,
} from '@/features/audit/types/audit'

// Re-export shared types from central location
export type {
  StatusSOP,
  JenisLangkahProsedur,
  SatuanWaktu,
  JenisLampiran,
  BagianSOP,
  SOPDetailMetadata,
  ProsedurRow,
  SopItem,
  SOPTemplate,
  PelaksanaRow,
  StatusSop,
} from '@/types/common'

// UI constants
export { SOP_STATUS_FILTER_OPTIONS, DEFAULT_SOP_STATUS } from './types/sop'

// Services (only depend on types)
export { sopApi } from './services/sop.api'

// Hooks (depend on services and types)
// Query hooks
export { useSop, useSopDetail } from './hooks/useSop'
export { useDetailSopList as useDetailSop, useDetailSopById } from './hooks/useDetailSop'
export { useSopStatus } from './hooks/useSopStatus'
export { usePelaksana } from './hooks/usePelaksana'
export { useDaftarSopFilters } from './hooks/useDaftarSopFilters'
export { useDaftarSopData } from './hooks/useDaftarSopData'
export { useRequestEvaluasi } from './hooks/useRequestEvaluasi'

// Business logic helpers
export { canEditSop, canKepalaOpdSignSop, isSopEligibleForSigning } from './hooks/useSop'
export { canTimPenyusunRunCoordinatorActions, isSopInEvaluasiList, canSelectSOPForEvaluasi } from './hooks/useSop'

// Initial state helpers (legitimate - used for form defaults)
export {
  getInitialSopDetailMetadata,
  getInitialSopDetailProsedurRows,
  getInitialSopDetailImplementers,
  getInitialSopDetailVersions,
} from './hooks/useDetailSop'

// Edit history
export { useEditHistory, useSopVersionSnapshot } from './hooks/useDetailSop'

// Components (depend on everything - export selectively)
export { BuatSOPDialog } from './components/BuatSOPDialog'
export { KomentarPanel } from './components/KomentarPanel'
export { RiwayatStatusPanel } from './components/RiwayatStatusPanel'
export { SOPListCard } from './components/SOPListCard'
export { SOPPreviewTemplate } from './components/SOPPreviewTemplate'
export { SOPStatusFilterSelect } from './components/SOPStatusFilterSelect'
export { VersionHistoryPanel } from './components/VersionHistoryPanel'
export { SOPDiagramFlowchart } from './components/SOPDiagram/SOPDiagramFlowchart'
export { SOPDiagramBpmn } from './components/SOPDiagram/SOPDiagramBpmn'
export { SOPHeaderInfo } from './components/SOPDiagram/SOPHeaderInfo'

// Export component types
export type { VersionHistoryItem } from './components/VersionHistoryPanel'
