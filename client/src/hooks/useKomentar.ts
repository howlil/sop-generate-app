/**
 * useKomentar Hook - Real API Implementation
 */

import { useState, useCallback } from 'react'

export interface KomentarDisplay {
  id: string
  text: string
  author: string
  role: string
  createdAt: string
  resolved: boolean
}

interface UseKomentarParams {
  initialData?: KomentarDisplay[]
  includeRoles?: string[]
}

export function useKomentar(params: UseKomentarParams = {}) {
  const [displayList, setDisplayList] = useState<KomentarDisplay[]>(params.initialData || [])

  const handleResolveComment = useCallback((komentarId: string) => {
    setDisplayList((prev) =>
      prev.map((k) => (k.id === komentarId ? { ...k, resolved: true } : k))
    )
  }, [])

  const addKomentar = useCallback((komentar: Omit<KomentarDisplay, 'id' | 'createdAt' | 'resolved'>) => {
    const newKomentar: KomentarDisplay = {
      ...komentar,
      id: `komentar-${Date.now()}`,
      createdAt: new Date().toISOString(),
      resolved: false,
    }
    setDisplayList((prev) => [...prev, newKomentar])
  }, [])

  return {
    displayList,
    handleResolveComment,
    addKomentar,
  }
}
