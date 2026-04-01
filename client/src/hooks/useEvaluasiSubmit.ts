import { useState, useCallback, useMemo } from 'react'
import type { SopItem } from '@/lib/types/sop'

export interface EvaluasiBatchSubmitError {
  sopId: string
  message: string
}

export interface UseEvaluasiSubmitOptions {
  sedangDievaluasiList: SopItem[]
  namaEvaluator: string
  ratingOPD: number | null
  opdId?: string
  setLastEvaluatedBy: (fn: (prev: any) => any) => void
  onSuccess?: () => void
}

export const POST_SUBMIT_DELAY_MS = 1500

/**
 * Hook for submitting evaluasi results
 * @deprecated Use API instead
 */
export function useEvaluasiSubmit({
  sedangDievaluasiList,
  namaEvaluator,
  ratingOPD,
  opdId,
  setLastEvaluatedBy,
  onSuccess,
}: UseEvaluasiSubmitOptions) {
  const [submitSelectedIds, setSubmitSelectedIds] = useState<Set<string>>(new Set())
  const [submitCheckAll, setSubmitCheckAll] = useState(false)
  const [terjadwalSubmitError, setTerjadwalSubmitError] =
    useState<EvaluasiBatchSubmitError | null>(null)

  const handleSubmitAll = useCallback(async () => {
    console.log('Submitting evaluasi for:', Array.from(submitSelectedIds))
    // Legacy stub - in production, this should call API
    onSuccess?.()
  }, [submitSelectedIds, onSuccess])

  const clearTerjadwalSubmitError = useCallback(() => {
    setTerjadwalSubmitError(null)
  }, [])

  return useMemo(
    () => ({
      submitSelectedIds,
      setSubmitSelectedIds,
      submitCheckAll,
      setSubmitCheckAll,
      handleSubmitAll,
      terjadwalSubmitError,
      clearTerjadwalSubmitError,
    }),
    [
      submitSelectedIds,
      submitCheckAll,
      handleSubmitAll,
      terjadwalSubmitError,
      clearTerjadwalSubmitError,
    ]
  )
}
