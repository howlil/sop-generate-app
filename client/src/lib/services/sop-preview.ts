import type { ProsedurRow } from '@/lib/types/sop'
import { SEED_SOP_DETAIL_PROSEDUR_ROWS, SEED_IMPLEMENTERS } from '@/lib/seed/sop-detail-seed'

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
    prosedurRows: SEED_SOP_DETAIL_PROSEDUR_ROWS,
    implementers: SEED_IMPLEMENTERS,
  }
}
