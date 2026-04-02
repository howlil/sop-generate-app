/**
 * useEvaluasiSubmit Hook
 * Manages batch SOP evaluation submission with check-all state.
 * Uses evaluasiApi.isiNilai() + evaluasiApi.selesai() for real API calls.
 */

import { useState, useCallback, useMemo } from 'react'
import { evaluasiApi } from '@/features/evaluasi'
import { useToast } from '@/utils/ui'
import type { StatusHasilEvaluasi } from '@/features/evaluasi'

export interface EvaluasiBatchSubmitError {
  sopId: string
  message: string
}

export interface EvaluasiSubmitItem {
  id: string
  judul: string
  nomorSOP: string
  hasil: StatusHasilEvaluasi
  komentarEvaluasi: string
}

interface UseEvaluasiSubmitConfig {
  sedangDievaluasiList: EvaluasiSubmitItem[]
  namaEvaluator: string
  ratingOPD: number | null
  opdId?: string
  setLastEvaluatedBy: (fn: (prev: any) => any) => void
  onSuccess?: () => void
}

export function useEvaluasiSubmit(config: UseEvaluasiSubmitConfig) {
  const { sedangDievaluasiList, namaEvaluator, ratingOPD, setLastEvaluatedBy, onSuccess } = config
  const { showToast } = useToast()
  const [submitSelectedIds, setSubmitSelectedIds] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [terjadwalSubmitError, setTerjadwalSubmitError] = useState<string | null>(null)

  const isSubmitCheckAll = useMemo(
    () => sedangDievaluasiList.length > 0 && submitSelectedIds.size === sedangDievaluasiList.length,
    [sedangDievaluasiList, submitSelectedIds]
  )

  const isSubmitCheckAllIndeterminate = useMemo(
    () => submitSelectedIds.size > 0 && submitSelectedIds.size < sedangDievaluasiList.length,
    [sedangDievaluasiList, submitSelectedIds]
  )

  const toggleSubmitSelected = useCallback((id: string) => {
    setSubmitSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const setSubmitCheckAll = useCallback((checked: boolean) => {
    if (checked) {
      setSubmitSelectedIds(new Set(sedangDievaluasiList.map((i) => i.id)))
    } else {
      setSubmitSelectedIds(new Set())
    }
  }, [sedangDievaluasiList])

  const clearTerjadwalSubmitError = useCallback(() => {
    setTerjadwalSubmitError(null)
  }, [])

  const handleSubmitAll = useCallback(async (pengajuanId?: string) => {
    if (submitSelectedIds.size === 0) return

    const selected = sedangDievaluasiList.filter((i) => submitSelectedIds.has(i.id))
    if (selected.length === 0) return

    setIsSubmitting(true)
    setTerjadwalSubmitError(null)

    try {
      if (pengajuanId) {
        // Submit each SOP evaluation via API
        for (const item of selected) {
          await evaluasiApi.isiNilai(pengajuanId, item.id, {
            hasil: item.hasil,
            catatan: item.komentarEvaluasi || undefined,
            version: 0,
          })
        }

        // If ratingOPD is set, complete the evaluation
        if (ratingOPD != null) {
          await evaluasiApi.selesai(pengajuanId, {
            nilaiOPD: ratingOPD,
          })
        }
      }

      // Update local state to mark as evaluated
      const now = new Date().toISOString()
      setLastEvaluatedBy((prev: any) => {
        const next = { ...prev }
        for (const item of selected) {
          next[item.id] = { date: now, evaluatorName: namaEvaluator }
        }
        return next
      })

      showToast(`${selected.length} SOP berhasil dievaluasi`, 'success')
      onSuccess?.()
    } catch (error) {
      const err = error as Error
      setTerjadwalSubmitError(err.message || 'Gagal mengirim evaluasi')
      showToast(err.message || 'Gagal mengirim evaluasi', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }, [submitSelectedIds, sedangDievaluasiList, namaEvaluator, ratingOPD, setLastEvaluatedBy, onSuccess, showToast])

  return {
    submitSelectedIds,
    setSubmitSelectedIds,
    isSubmitting,
    isSubmitCheckAll,
    isSubmitCheckAllIndeterminate,
    toggleSubmitSelected,
    setSubmitCheckAll,
    handleSubmitAll,
    terjadwalSubmitError,
    clearTerjadwalSubmitError,
  }
}
