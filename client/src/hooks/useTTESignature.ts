import { useState, useEffect, useCallback, useMemo } from 'react'

export interface TTESignature {
  id: string
  documentId: string
  referenceId: string
  signedAt: string
  nip: string
  namaLengkap: string
  role: string
  documentLabel: string
}

const STORAGE_KEY = 'tte_signature'

/**
 * Mock data for development
 */
const MOCK_DATA: Record<string, TTESignature> = {}

/**
 * Hook to manage TTE signature
 * @deprecated Use API instead
 */
export function useTTESignature(documentId?: string) {
  const [signature, setSignature] = useState<TTESignature | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadSignature = useCallback(async () => {
    if (!documentId) return
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 100))
      setSignature(MOCK_DATA[documentId] || null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    loadSignature()
  }, [loadSignature])

  const sign = useCallback(async (data: Omit<TTESignature, 'id'>) => {
    console.log('Signing with TTE:', data)
    // Legacy stub - in production, this should call API
    return { id: 'generated-id', ...data }
  }, [])

  return useMemo(
    () => ({
      signature,
      loading,
      error,
      loadSignature,
      sign,
    }),
    [signature, loading, error, loadSignature, sign]
  )
}
