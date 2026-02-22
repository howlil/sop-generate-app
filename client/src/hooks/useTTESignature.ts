/**
 * Shared hook for TTE (digital signature) verification flow.
 */
import { useState, useEffect, useCallback } from 'react'
import type { TTESignaturePayload, TTERole } from '@/lib/types/tte'
import { getTTEProfile, verifyPin, addTTESignature, getTTESignatures } from '@/lib/tte'

interface UseTTESignatureOptions {
  role: TTERole
  documentId: string | undefined
}

interface SignDocumentParams {
  documentLabel: string
  referenceId: string
}

export function useTTESignature({ role, documentId }: UseTTESignatureOptions) {
  const [ttePayload, setTtePayload] = useState<TTESignaturePayload | null>(null)
  const [pinDialogOpen, setPinDialogOpen] = useState(false)

  useEffect(() => {
    if (!documentId) return
    const sig = getTTESignatures().find(
      (s) => s.documentId === documentId && s.role === role
    )
    setTtePayload(sig ?? null)
  }, [documentId, role])

  const tteProfile = getTTEProfile(role)
  const canSign = tteProfile?.emailVerified === true

  const openPinDialog = useCallback(() => {
    if (!canSign) return
    setPinDialogOpen(true)
  }, [canSign])

  const createPinConfirmHandler = useCallback(
    (params: SignDocumentParams, onSuccess?: (payload: TTESignaturePayload) => void) => {
      return (pin: string): boolean => {
        const profile = getTTEProfile(role)
        if (!profile || !verifyPin(pin, profile.pinHash) || !documentId) return false

        const payload = addTTESignature(
          role,
          profile.nip,
          profile.nama,
          documentId,
          params.documentLabel,
          params.referenceId
        )
        setTtePayload(payload)
        setPinDialogOpen(false)
        onSuccess?.(payload)
        return true
      }
    },
    [role, documentId]
  )

  return {
    ttePayload,
    setTtePayload,
    pinDialogOpen,
    setPinDialogOpen,
    canSign,
    openPinDialog,
    createPinConfirmHandler,
  }
}
