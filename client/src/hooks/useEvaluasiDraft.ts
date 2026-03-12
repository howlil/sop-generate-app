/**
 * Hook for persisting evaluasi draft to localStorage.
 */
import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/useUI'

export interface EvaluasiDraftData {
  komentarEvaluasi: string
  statusEvaluasi: 'Sesuai' | 'Revisi Biro' | null
}

const DRAFT_STORAGE_PREFIX = 'evaluasi_draft_'
function getStorageKey(id: string): string {
  return `${DRAFT_STORAGE_PREFIX}${id}`
}

/** Baca draft evaluasi dari localStorage (untuk list Sedang Dievaluasi & kirim semua). */
export function getEvaluasiDraft(sopId: string): EvaluasiDraftData | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(getStorageKey(sopId))
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as Partial<EvaluasiDraftData>
    if (data.statusEvaluasi != null) {
      const komentar = typeof data.komentarEvaluasi === 'string' ? data.komentarEvaluasi : ''
      if (data.statusEvaluasi !== 'Revisi Biro' || komentar.trim() !== '') {
        return { komentarEvaluasi: komentar, statusEvaluasi: data.statusEvaluasi }
      }
    }
    return null
  } catch {
    return null
  }
}

export function clearEvaluasiDraft(sopId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(getStorageKey(sopId))
}

export function useEvaluasiDraft(id: string | undefined) {
  const { showToast } = useToast()
  const [komentarEvaluasi, setKomentarEvaluasi] = useState('')
  const [statusEvaluasi, setStatusEvaluasi] = useState<'Sesuai' | 'Revisi Biro' | null>(null)

  useEffect(() => {
    if (!id) return
    const draft = getEvaluasiDraft(id)
    if (!draft) return
    setKomentarEvaluasi(draft.komentarEvaluasi)
    setStatusEvaluasi(draft.statusEvaluasi)
  }, [id])

  const saveDraft = useCallback(() => {
    if (!id) return
    localStorage.setItem(
      getStorageKey(id),
      JSON.stringify({ komentarEvaluasi, statusEvaluasi })
    )
    showToast('Draft evaluasi berhasil disimpan')
  }, [id, komentarEvaluasi, statusEvaluasi])

  const clearDraft = useCallback(() => {
    if (!id) return
    localStorage.removeItem(getStorageKey(id))
  }, [id])

  return {
    komentarEvaluasi,
    setKomentarEvaluasi,
    statusEvaluasi,
    setStatusEvaluasi,
    saveDraft,
    clearDraft,
  }
}
