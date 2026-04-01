import { useState, useEffect, useCallback, useMemo } from 'react'

export interface Pelaksana {
  id: string
  namaPelaksana: string
  opdId: string
}

const STORAGE_KEY = 'pelaksana'

/**
 * Mock data for development
 */
const MOCK_DATA: Pelaksana[] = []

/**
 * Hook to manage pelaksana list
 * @deprecated Use API instead
 */
export function usePelaksana(opdId?: string) {
  const [list, setList] = useState<Pelaksana[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadPelaksana = useCallback(async () => {
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
    loadPelaksana()
  }, [loadPelaksana])

  const addPelaksana = useCallback(async (data: Omit<Pelaksana, 'id'>) => {
    console.log('Adding pelaksana:', data)
    // Legacy stub - in production, this should call API
  }, [])

  const updatePelaksana = useCallback(async (id: string, data: Partial<Pelaksana>) => {
    console.log('Updating pelaksana:', id, data)
    // Legacy stub - in production, this should call API
  }, [])

  const deletePelaksana = useCallback(async (id: string) => {
    console.log('Deleting pelaksana:', id)
    // Legacy stub - in production, this should call API
  }, [])

  return useMemo(
    () => ({
      list,
      loading,
      error,
      loadPelaksana,
      addPelaksana,
      updatePelaksana,
      deletePelaksana,
    }),
    [
      list,
      loading,
      error,
      loadPelaksana,
      addPelaksana,
      updatePelaksana,
      deletePelaksana,
    ]
  )
}
