/**
 * useEvaluasiDraft Hook - Server-Side Auto-Save
 * Per-SOP evaluation draft state management with real API persistence
 * 
 * Workflow:
 * 1. Fetches active pengajuan evaluasi for the OPD
 * 2. Maps sopId (header) to sopDetailId from pengajuan.sopList
 * 3. Loads existing nilaiEvaluasi if any
 * 4. Auto-saves via evaluasiApi.isiNilai() with debounce
 * 5. Handles optimistic locking with version tracking
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { evaluasiApi } from '../services/evaluasi.api'
import { queryKeys } from '@/utils/query-keys'
import { useToast } from '@/utils/ui'
import { usePengajuanEvaluasiAktif } from './usePengajuanEvaluasiAktif'
import type { StatusHasilEvaluasi } from '@/types/common'

const AUTO_SAVE_DELAY_MS = 1500

export interface UseEvaluasiDraftReturn {
  statusEvaluasi: StatusHasilEvaluasi | null
  setStatusEvaluasi: (status: StatusHasilEvaluasi | null) => void
  komentarEvaluasi: string
  setKomentarEvaluasi: (komentar: string) => void
  saveDraft: () => void
  clearDraft: () => void
  isSaving: boolean
  error: Error | null
}

export function useEvaluasiDraft(opdId?: string, sopId?: string): UseEvaluasiDraftReturn {
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  // Fetch active pengajuan evaluasi
  const {
    pengajuanId,
    pengajuan,
    isLoading: isLoadingPengajuan,
    getCurrentVersion,
  } = usePengajuanEvaluasiAktif(opdId)

  // Map sopId (header) to sopDetailId from pengajuan
  const sopDetailId = useMemo(() => {
    if (!pengajuan || !sopId) return null
    // Find the SOP in pengajuan's sopList
    const sopInPengajuan = pengajuan.nilaiEvaluasi?.find(n => n.sopDetail?.id === sopId)
    // Or check if sopId is already the detail ID
    const sopInList = pengajuan.nilaiEvaluasi?.find(n => n.sopDetailId === sopId)
    return sopInPengajuan?.sopDetailId ?? sopInList?.sopDetailId ?? null
  }, [pengajuan, sopId])

  // Load existing nilaiEvaluasi from pengajuan
  const existingNilai = useMemo(() => {
    if (!pengajuan || !sopDetailId) return null
    return pengajuan.nilaiEvaluasi?.find(n => n.sopDetailId === sopDetailId) ?? null
  }, [pengajuan, sopDetailId])

  // Initialize state from existing nilai
  const [statusEvaluasi, setStatusEvaluasiState] = useState<StatusHasilEvaluasi | null>(
    existingNilai?.hasil ?? null
  )
  const [komentarEvaluasi, setKomentarEvaluasiState] = useState<string>(
    existingNilai?.catatan ?? ''
  )

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async ({
      status,
      komentar,
    }: {
      status: StatusHasilEvaluasi
      komentar: string
    }) => {
      if (!pengajuanId || !sopDetailId) {
        throw new Error('Data evaluasi belum tersedia')
      }

      const version = getCurrentVersion(sopDetailId)

      return evaluasiApi.isiNilai(pengajuanId, sopDetailId, {
        hasil: status,
        catatan: komentar,
        version,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
    },
    onError: (error: Error) => {
      if (error.message?.includes('Konflik versi')) {
        showToast('Data telah diubah orang lain. Silakan refresh halaman.', 'error')
      } else {
        showToast(error.message || 'Gagal menyimpan draft evaluasi', 'error')
      }
    },
  })

  /** Trigger auto-save with debounce */
  const triggerAutoSave = useCallback(() => {
    if (!pengajuanId || !sopDetailId || isLoadingPengajuan) return
    if (statusEvaluasi == null) return // Don't save if no status yet

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    const currentStatus = statusEvaluasi
    const currentKomentar = komentarEvaluasi

    autoSaveTimerRef.current = setTimeout(() => {
      saveDraftMutation.mutate({
        status: currentStatus,
        komentar: currentKomentar,
      })
    }, AUTO_SAVE_DELAY_MS)
  }, [pengajuanId, sopDetailId, isLoadingPengajuan, statusEvaluasi, komentarEvaluasi, saveDraftMutation])

  const setStatusEvaluasi = useCallback((status: StatusHasilEvaluasi | null) => {
    setStatusEvaluasiState(status)
    // Will trigger auto-save via useEffect
  }, [])

  const setKomentarEvaluasi = useCallback((komentar: string) => {
    setKomentarEvaluasiState(komentar)
    // Will trigger auto-save via useEffect
  }, [])

  // Auto-save when status or komentar changes
  useEffect(() => {
    triggerAutoSave()
  }, [triggerAutoSave])

  /** Manual save - immediate, no debounce */
  const saveDraft = useCallback(() => {
    if (!pengajuanId || !sopDetailId || statusEvaluasi == null) {
      showToast('Tidak dapat menyimpan: data belum lengkap', 'error')
      return
    }
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    saveDraftMutation.mutate({
      status: statusEvaluasi,
      komentar: komentarEvaluasi,
    })
  }, [pengajuanId, sopDetailId, statusEvaluasi, komentarEvaluasi, saveDraftMutation, showToast])

  const clearDraft = useCallback(() => {
    setStatusEvaluasiState(null)
    setKomentarEvaluasiState('')
  }, [])

  return {
    statusEvaluasi,
    setStatusEvaluasi,
    komentarEvaluasi,
    setKomentarEvaluasi,
    saveDraft,
    clearDraft,
    isSaving: saveDraftMutation.isPending,
    error: saveDraftMutation.error,
  }
}
