/**
 * Types riwayat versi SOP.
 */

import type { SOPDetailMetadata, DetailSOPViewMetadata, ProsedurRow } from '@/lib/types/sop'

export type RevisionType = 'major' | 'minor'

export interface VersionSeed {
  id: string
  version: string
  revisionType: RevisionType
  date: string
  author: string
  changes: string
  snapshot: { metadata: SOPDetailMetadata; prosedurRows: ProsedurRow[] } | null
}

export interface DetailSOPVersionSeed {
  id: string
  version: string
  date: string
  author: string
  changes: string
  snapshot: { metadata: DetailSOPViewMetadata; prosedurRows: ProsedurRow[] } | null
  eventLabel?: string
  revisionType?: RevisionType
}
