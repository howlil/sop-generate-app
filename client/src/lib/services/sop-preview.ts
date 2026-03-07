import type { ProsedurRow } from '@/lib/types/sop'
import {
  getInitialSopDetailProsedurRows,
  getInitialSopDetailImplementers,
} from '@/lib/data/sop-detail'

export interface SopPreviewData {
  prosedurRows: ProsedurRow[]
  implementers: { id: string; name: string }[]
}

/**
 * Get SOP detail data for preview.
 * Uses seed for now; can switch to API later.
 */
export function getSopDetailForPreview(_sopId: string | null): SopPreviewData {
  return {
    prosedurRows: getInitialSopDetailProsedurRows(),
    implementers: getInitialSopDetailImplementers(),
  }
}
