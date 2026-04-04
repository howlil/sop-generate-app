/**
 * useEvaluasiDraft Hook
 * Per-SOP evaluation draft state management with server-side auto-save
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useIsiNilaiEvaluasi } from './useEvaluasi'
import type { StatusHasilEvaluasi } from '@/types/common'

interface DraftEntry {
  statusEvaluasi: StatusHasilEvaluasi | null
  komentarEvaluasi: string
}

// Shared in-memory draft store across hook instances (fallback for offline)
const draftStore: Record<string, DraftEntry> = {}

// Auto-save debounce delay in milliseconds
const AUTO_SAVE_DELAY_MS = 2000

export interface UseEvaluasiDraftOptions {
  /** Pengajuan evaluasi ID (required for server-side save) */
  pengajuanId?: string
  /** SOP Detail ID (required for server-side save) */
  sopDetailId?: string
  /** Enable auto-save (default: true) */
  autoSave?: boolean
}

export function useEvaluasiDraft(sopId?: string, options?: UseEvaluasiDraftOptions) {
  const { pengajuanId, sopDetailId, autoSave = true } = options ?? {}
  const isiNilaiMutation = useIsiNilaiEvaluasi()

  const [statusEvaluasi, setStatusEvaluasiState] = useState<StatusHasilEvaluasi | null>(
    sopId ? draftStore[sopId]?.statusEvaluasi ?? null : null
  )
  const [komentarEvaluasi, setKomentarEvaluasiState] = useState<string>(
    sopId ? draftStore[sopId]?.komentarEvaluasi ?? '' : ''
  )
  const prevSopIdRef = useRef(sopId)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync state when sopId changes
  if (sopId !== prevSopIdRef.current) {
    prevSopIdRef.current = sopId
    const entry = sopId ? draftStore[sopId] : undefined
    setStatusEvaluasiState(entry?.statusEvaluasi ?? null)
    setKomentarEvaluasiState(entry?.komentarEvaluasi ?? '')
  }

  // Clear auto-save timer on unmount or sopId change
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])

  /** Trigger auto-save with debounce */
  const triggerAutoSave = useCallback(() => {
    if (!autoSave || !pengajuanId || !sopDetailId) return
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    autoSaveTimerRef.current = setTimeout(() => {
      if (statusEvaluasi != null) {
        isiNilaiMutation.mutate({
          pengajuanEvaluasiId: pengajuanId,
          sopDetailId: sopDetailId,
          payload: {
            hasil: statusEvaluasi,
            catatan: komentarEvaluasi,
          },
        })
      }
    }, AUTO_SAVE_DELAY_MS)
  }, [autoSave, pengajuanId, sopDetailId, statusEvaluasi, komentarEvaluasi, isiNilaiMutation])

  const setStatusEvaluasi = useCallback((status: StatusHasilEvaluasi | null) => {
    setStatusEvaluasiState(status)
    if (sopId) {
      draftStore[sopId] = {
        ...draftStore[sopId],
        statusEvaluasi: status,
        komentarEvaluasi: draftStore[sopId]?.komentarEvaluasi ?? '',
      }
    }
    triggerAutoSave()
  }, [sopId, triggerAutoSave])

  const setKomentarEvaluasi = useCallback((komentar: string) => {
    setKomentarEvaluasiState(komentar)
    if (sopId) {
      draftStore[sopId] = {
        ...draftStore[sopId],
        statusEvaluasi: draftStore[sopId]?.statusEvaluasi ?? null,
        komentarEvaluasi: komentar,
      }
    }
    triggerAutoSave()
  }, [sopId, triggerAutoSave])

  /** Manual save - immediate, no debounce */
  const saveDraft = useCallback(() => {
    if (!pengajuanId || !sopDetailId || statusEvaluasi == null) return
    isiNilaiMutation.mutate({
      pengajuanEvaluasiId: pengajuanId,
      sopDetailId: sopDetailId,
      payload: {
        hasil: statusEvaluasi,
        catatan: komentarEvaluasi,
      },
    })
  }, [pengajuanId, sopDetailId, statusEvaluasi, komentarEvaluasi, isiNilaiMutation])

  const clearDraft = useCallback((targetSopId?: string) => {
    const id = targetSopId ?? sopId
    if (id) {
      delete draftStore[id]
    }
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
  }, [sopId])

  return {
    statusEvaluasi,
    setStatusEvaluasi,
    komentarEvaluasi,
    setKomentarEvaluasi,
    saveDraft,
    clearDraft,
    isSaving: isiNilaiMutation.isPending,
  }
}

/**
 * Get draft for a specific SOP (used outside React component context)
 */
export function getEvaluasiDraft(sopId: string): DraftEntry | undefined {
  return draftStore[sopId]
}

