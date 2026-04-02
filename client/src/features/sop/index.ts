/**
 * SOP Feature Module
 * Standard Operating Procedure lifecycle management
 */

// Types (no dependencies on other features)
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
  LogEditSOP,
} from './types/sop'

export type {
  StatusSOP,
  JenisLangkahProsedur,
  SatuanWaktu,
  JenisLampiran,
  BagianSOP,
} from './types/common'

export { SOP_STATUS_FILTER_OPTIONS, DEFAULT_SOP_STATUS } from './types/types'

// Services (only depend on types)
export { sopApi } from './services/sop.api'

// Hooks (depend on services and types)
export { useSop, useSopDetail, canEditSop, canKepalaOpdSignSop, isSopEligibleForSigning, canTimPenyusunRunCoordinatorActions, isSopInEvaluasiList, canSelectSOPForEvaluasi } from './hooks/useSop'
export { useDetailSop, getInitialSopDetailMetadata, getInitialSopDetailProsedurRows, getInitialSopDetailImplementers, getInitialSopDetailVersions, useDetailSopById, useEditHistory } from './hooks/useDetailSop'
export { useSopStatus } from './hooks/useSopStatus'
export { usePelaksana } from './hooks/usePelaksana'
export { useDaftarSOPFilters } from './hooks/useDaftarSOPFilters'
export { useDaftarSOPData } from './hooks/useDaftarSOPData'

// Components (depend on everything - export selectively)
export { BuatSOPDialog } from './components/BuatSOPDialog'
export { KomentarPanel } from './components/KomentarPanel'
export { RiwayatStatusPanel } from './components/RiwayatStatusPanel'
export { SOPListCard } from './components/SOPListCard'
export { SOPPreviewTemplate } from './components/SOPPreviewTemplate'
export { SOPStatusFilterSelect } from './components/SOPStatusFilterSelect'
export { VersionHistoryPanel } from './components/VersionHistoryPanel'
