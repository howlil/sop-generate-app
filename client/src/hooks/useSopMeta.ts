import { useCallback } from 'react'
import { useSopMetaStore, setSopMeta as setMetaFn, mergeSopMeta as mergeSopMetaFn } from '@/lib/stores/sop-meta-store'

export function useSopMeta() {
  const metas = useSopMetaStore((s) => s.metas)

  const setSopMeta = useCallback((sopId: string, lastEditedBy: string) => {
    setMetaFn(sopId, {
      lastEditedBy,
      lastEditedAt: new Date().toISOString().split('T')[0],
    })
  }, [])

  const getSopMeta = useCallback(
    (sopId: string) => metas[sopId],
    [metas]
  )

  const mergeSopMeta = <T extends { id: string; lastEditedBy?: string; lastEditedAt?: string }>(list: T[]): T[] =>
    mergeSopMetaFn(list)

  return { setSopMeta, getSopMeta, mergeSopMeta }
}
