import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'evaluasi_draft'

export interface EvaluasiDraft {
  sopId: string
  komentarEvaluasi: string
  statusEvaluasi: 'Sesuai' | 'Revisi Biro' | null
}

/**
 * Hook untuk manage draft evaluasi SOP (localStorage-based).
 * Digunakan oleh Tim Evaluasi saat mengisi form evaluasi.
 */
export function useEvaluasiDraft(sopId: string | undefined) {
  const [komentarEvaluasi, setKomentarEvaluasi] = useState<string>('')
  const [statusEvaluasi, setStatusEvaluasi] = useState<'Sesuai' | 'Revisi Biro' | null>(null)

  // Load draft from localStorage on mount or when sopId changes
  useEffect(() => {
    if (!sopId) {
      setKomentarEvaluasi('')
      setStatusEvaluasi(null)
      return
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const drafts: Record<string, EvaluasiDraft> = JSON.parse(stored)
        const draft = drafts[sopId]
        if (draft) {
          setKomentarEvaluasi(draft.komentarEvaluasi || '')
          setStatusEvaluasi(draft.statusEvaluasi || null)
        }
      }
    } catch (error) {
      console.error('Failed to load evaluasi draft:', error)
    }
  }, [sopId])

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    if (!sopId) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const drafts: Record<string, EvaluasiDraft> = stored ? JSON.parse(stored) : {}
      drafts[sopId] = {
        sopId,
        komentarEvaluasi,
        statusEvaluasi,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
    } catch (error) {
      console.error('Failed to save evaluasi draft:', error)
    }
  }, [sopId, komentarEvaluasi, statusEvaluasi])

  // Clear draft for specific SOP
  const clearDraft = useCallback((targetSopId?: string) => {
    const id = targetSopId || sopId
    if (!id) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const drafts: Record<string, EvaluasiDraft> = JSON.parse(stored)
        delete drafts[id]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
      }
    } catch (error) {
      console.error('Failed to clear evaluasi draft:', error)
    }
  }, [sopId])

  return {
    komentarEvaluasi,
    setKomentarEvaluasi,
    statusEvaluasi,
    setStatusEvaluasi,
    saveDraft,
    clearDraft,
  }
}

/**
 * Get draft evaluasi untuk SOP tertentu (sync, untuk SSR/hydration)
 */
export function getEvaluasiDraft(sopId: string): EvaluasiDraft | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const drafts: Record<string, EvaluasiDraft> = JSON.parse(stored)
      return drafts[sopId] || null
    }
  } catch (error) {
    console.error('Failed to get evaluasi draft:', error)
  }
  return null
}
