import { useState, useEffect } from 'react'
import { getPenugasanById, getPenugasanList, subscribePenugasan, updatePenugasan } from '@/lib/stores/penugasan-store'
import type { Penugasan } from '@/lib/types/penugasan'
import type { TTESignaturePayload } from '@/lib/types/tte'
import { canVerifyPenugasan, generateBANumber } from '@/lib/domain/sop-status'

export interface UsePenugasanEvaluasiResult {
  penugasan: Penugasan | null
  selectedSopId: string | null
  setSelectedSopId: (id: string | null) => void
  /** Call when TTE pin verification succeeds. Pass payload from createPinConfirmHandler. */
  handleVerifySuccess: (payload: TTESignaturePayload) => void
  canVerify: boolean
}

/**
 * Domain hook untuk Biro: detail batch evaluasi dan verifikasi (Berita Acara).
 * Manages penugasan state, subscription, and verification success handler.
 */
export function usePenugasanEvaluasi(id: string | undefined): UsePenugasanEvaluasiResult {
  const [penugasan, setPenugasan] = useState<Penugasan | null>(() =>
    id ? getPenugasanById(id) ?? null : null,
  )
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const unsub = subscribePenugasan(() => setPenugasan(getPenugasanById(id) ?? null))
    return unsub
  }, [id])

  const handleVerifySuccess = (payload: TTESignaturePayload) => {
    if (!penugasan) return
    const batchNumber = generateBANumber(getPenugasanList().filter((h) => h.isVerified).length)
    updatePenugasan(penugasan.id, {
      status: 'Terverifikasi',
      isVerified: true,
      nomorBA: batchNumber,
      tanggalVerifikasi: new Date().toISOString().split('T')[0],
      namaBiro: payload.nama,
      tteSignaturePayload: payload,
    })
  }

  return {
    penugasan,
    selectedSopId,
    setSelectedSopId,
    handleVerifySuccess,
    canVerify: penugasan ? canVerifyPenugasan(penugasan) : false,
  }
}
