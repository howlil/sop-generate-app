import { useState } from 'react'
import type { ProsedurRow } from '@/lib/types/sop'
import {
  SEED_SOP_DETAIL_PROSEDUR_ROWS,
  SEED_IMPLEMENTERS,
} from '@/lib/seed/sop-detail-seed'

export function useDetailSOPProsedur() {
  const [prosedurRows, setProsedurRows] = useState<ProsedurRow[]>(() => [...SEED_SOP_DETAIL_PROSEDUR_ROWS])
  const [implementers, setImplementers] = useState(() => [...SEED_IMPLEMENTERS])
  const [diagramVersion, setDiagramVersion] = useState(0)

  return {
    prosedurRows,
    setProsedurRows,
    implementers,
    setImplementers,
    diagramVersion,
    setDiagramVersion,
  }
}
