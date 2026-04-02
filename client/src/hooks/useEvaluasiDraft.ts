/**
 * useEvaluasiDraft Hook
 * Per-SOP evaluation draft state management (in-memory)
 */

import { useState, useCallback, useRef } from 'react'
import type { StatusHasilEvaluasi } from '@/lib/domain/evaluasi'

interface DraftEntry {
  statusEvaluasi: StatusHasilEvaluasi | null
  komentarEvaluasi: string
}

// Shared in-memory draft store across hook instances
const draftStore: Record<string, DraftEntry> = {}

export function useEvaluasiDraft(sopId?: string) {
  const [statusEvaluasi, setStatusEvaluasiState] = useState<StatusHasilEvaluasi | null>(
    sopId ? draftStore[sopId]?.statusEvaluasi ?? null : null
  )
  const [komentarEvaluasi, setKomentarEvaluasiState] = useState<string>(
    sopId ? draftStore[sopId]?.komentarEvaluasi ?? '' : ''
  )
  const prevSopIdRef = useRef(sopId)

  // Sync state when sopId changes
  if (sopId !== prevSopIdRef.current) {
    prevSopIdRef.current = sopId
    const entry = sopId ? draftStore[sopId] : undefined
    setStatusEvaluasiState(entry?.statusEvaluasi ?? null)
    setKomentarEvaluasiState(entry?.komentarEvaluasi ?? '')
  }

  const setStatusEvaluasi = useCallback((status: StatusHasilEvaluasi | null) => {
    setStatusEvaluasiState(status)
    if (sopId) {
      draftStore[sopId] = {
        ...draftStore[sopId],
        statusEvaluasi: status,
        komentarEvaluasi: draftStore[sopId]?.komentarEvaluasi ?? '',
      }
    }
  }, [sopId])

  const setKomentarEvaluasi = useCallback((komentar: string) => {
    setKomentarEvaluasiState(komentar)
    if (sopId) {
      draftStore[sopId] = {
        ...draftStore[sopId],
        statusEvaluasi: draftStore[sopId]?.statusEvaluasi ?? null,
        komentarEvaluasi: komentar,
      }
    }
  }, [sopId])

  const clearDraft = useCallback((targetSopId?: string) => {
    const id = targetSopId ?? sopId
    if (id) {
      delete draftStore[id]
    }
  }, [sopId])

  return {
    statusEvaluasi,
    setStatusEvaluasi,
    komentarEvaluasi,
    setKomentarEvaluasi,
    clearDraft,
  }
}

/**
 * Get draft for a specific SOP (used outside React component context)
 */
export function getEvaluasiDraft(sopId: string): DraftEntry | undefined {
  return draftStore[sopId]
}
