import { useState, useCallback } from 'react'
import { SEED_SOP_DETAIL_METADATA } from '@/lib/seed/sop-detail-seed'
import type { SOPDetailMetadata } from '@/lib/seed/sop-detail-seed'


export function useDetailSOPMetadata() {
  const [metadata, setMetadata] = useState<SOPDetailMetadata>(() => ({ ...SEED_SOP_DETAIL_METADATA }))

  const handleMetadataChange = useCallback((field: string, value: unknown) => {
    setMetadata((prev) => ({ ...prev, [field]: value }))
  }, [])

  return { metadata, setMetadata, handleMetadataChange }
}
