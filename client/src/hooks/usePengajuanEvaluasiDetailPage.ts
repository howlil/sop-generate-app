import { useState, useEffect, useCallback, useMemo } from 'react'
import type { PengajuanEvaluasi } from '@/lib/types/pengajuan-evaluasi'

const STORAGE_KEY = 'pengajuan_evaluasi_detail'

/**
 * Mock data for development
 */
const MOCK_DATA: Record<string, PengajuanEvaluasi> = {}

/**
 * Hook to manage pengajuan evaluasi detail
 * @deprecated Use API instead
 */
export function usePengajuanEvaluasiDetailPage(id: string) {
  const [detail, setDetail] = useState<PengajuanEvaluasi | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadDetail = useCallback(async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 100))
      setDetail(MOCK_DATA[id] || null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  const approve = useCallback(async () => {
    console.log('Approving pengajuan evaluasi:', id)
    // Legacy stub - in production, this should call API
  }, [id])

  const reject = useCallback(async (reason: string) => {
    console.log('Rejecting pengajuan evaluasi:', id, reason)
    // Legacy stub - in production, this should call API
  }, [id])

  return useMemo(
    () => ({
      detail,
      loading,
      error,
      loadDetail,
      approve,
      reject,
    }),
    [detail, loading, error, loadDetail, approve, reject]
  )
}
