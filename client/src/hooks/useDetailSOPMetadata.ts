import { useState, useCallback } from 'react'
import { SEED_SOP_DETAIL_METADATA } from '@/lib/seed/sop-detail-seed'
import type { SOPDetailMetadata } from '@/lib/types/sop'

export function useDetailSOPMetadata() {
  const [metadata, setMetadata] = useState<SOPDetailMetadata>(() => ({ ...SEED_SOP_DETAIL_METADATA }))

  const handleMetadataChange = useCallback(
    <K extends keyof SOPDetailMetadata>(field: K, value: SOPDetailMetadata[K]) => {
      setMetadata((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  return { metadata, setMetadata, handleMetadataChange }
}
