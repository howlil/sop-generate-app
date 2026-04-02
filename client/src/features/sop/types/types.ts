/**
 * SOP UI types for component state
 * Re-exports from @/types/common for backward compatibility
 */

// Re-export from central types
export type {
  SOPDetailMetadata,
  ProsedurRow,
  SopItem,
  SOPDaftarItem,
  SOPTemplate,
} from '@/types/common'

/**
 * SOP status filter options
 * Note: This is UI-specific constant, not a type definition
 */
export const SOP_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'SEDANG_DISUSUN', label: 'SEDANG_DISUSUN' },
  { value: 'SIAP_DIEVALUASI', label: 'SIAP_DIEVALUASI' },
  { value: 'DIAJUKAN_EVALUASI', label: 'DIAJUKAN_EVALUASI' },
  { value: 'SEDANG_DIEVALUASI', label: 'SEDANG_DIEVALUASI' },
  { value: 'REVISI_DARI_TIM_EVALUASI', label: 'REVISI_DARI_TIM_EVALUASI' },
  { value: 'SIAP_DIVERIFIKASI', label: 'SIAP_DIVERIFIKASI' },
  { value: 'DIVERIFIKASI_BIRO_ORGANISASI', label: 'DIVERIFIKASI_BIRO_ORGANISASI' },
  { value: 'BERLAKU', label: 'BERLAKU' },
  { value: 'DICABUT', label: 'DICABUT' },
] as const

/**
 * Default SOP status for new instances
 */
export const DEFAULT_SOP_STATUS = 'DRAFT'
