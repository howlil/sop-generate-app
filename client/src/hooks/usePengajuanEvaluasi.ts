import { useState, useEffect, useCallback, useMemo } from 'react'
import type { PengajuanEvaluasi } from '@/lib/types/pengajuan-evaluasi'

const STORAGE_KEY = 'pengajuan_evaluasi'

/**
 * Mock data for development
 */
const MOCK_DATA: PengajuanEvaluasi[] = []

/**
 * Hook to manage pengajuan evaluasi list
 * @deprecated Use API instead
 */
export function usePengajuanEvaluasiList() {
  const [list, setList] = useState<PengajuanEvaluasi[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadPengajuanEvaluasi = useCallback(async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 100))
      setList(MOCK_DATA)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPengajuanEvaluasi()
  }, [loadPengajuanEvaluasi])

  return useMemo(
    () => ({
      list,
      loading,
      error,
      loadPengajuanEvaluasi,
    }),
    [list, loading, error, loadPengajuanEvaluasi]
  )
}

/**
 * Get pengajuan evaluasi by SOP ID
 * @deprecated Use API instead
 */
export function getPengajuanEvaluasiBySopId(sopId: string): PengajuanEvaluasi | null {
  return MOCK_DATA.find((p) => p.sopId === sopId) || null
}
