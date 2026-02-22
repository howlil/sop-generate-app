/**
 * Hook for persisting evaluasi draft to localStorage.
 */
import { useState, useEffect, useCallback } from 'react'
import { showToast } from '@/lib/stores'

interface EvaluasiDraftData {
  komentarEvaluasi: string
  statusEvaluasi: 'Sesuai' | 'Revisi Biro' | null
}

function getStorageKey(id: string): string {
  return `evaluasi_draft_${id}`
}

export function useEvaluasiDraft(id: string | undefined) {
  const [komentarEvaluasi, setKomentarEvaluasi] = useState('')
  const [statusEvaluasi, setStatusEvaluasi] = useState<'Sesuai' | 'Revisi Biro' | null>(null)

  useEffect(() => {
    if (!id) return
    const raw = localStorage.getItem(getStorageKey(id))
    if (!raw) return
    try {
      const data = JSON.parse(raw) as Partial<EvaluasiDraftData>
      if (data.komentarEvaluasi) setKomentarEvaluasi(data.komentarEvaluasi)
      if (data.statusEvaluasi) setStatusEvaluasi(data.statusEvaluasi)
    } catch {
      // ignore corrupt data
    }
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
