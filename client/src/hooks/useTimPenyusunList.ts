import { useState, useEffect, useCallback, useMemo } from 'react'

export interface TimPenyusun {
  id: string
  userId: string
  opdId: string
  peran: string
  status: 'AKTIF' | 'NONAKTIF'
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'tim_penyusun'

/**
 * Mock data for development
 */
const MOCK_DATA: TimPenyusun[] = []

/**
 * Hook to manage Tim Penyusun list
 * @deprecated Use API instead
 */
export function useTimPenyusunList(opdId?: string) {
  const [list, setList] = useState<TimPenyusun[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadTimPenyusun = useCallback(async () => {
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
    loadTimPenyusun()
  }, [loadTimPenyusun])

  return useMemo(
    () => ({
      list,
      loading,
      error,
      loadTimPenyusun,
    }),
    [list, loading, error, loadTimPenyusun]
  )
}
