import { useState } from 'react'
import type { TTESignaturePayload } from '@/lib/types/tte'
import { canVerifyPenugasan, generateBANumber } from '@/lib/domain/sop-status'
import { usePenugasanDetail, usePenugasanList } from '@/hooks/usePenugasan'
import type { Penugasan } from '@/lib/types/penugasan'

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
  const { penugasan, updatePenugasan } = usePenugasanDetail(id)
  const { list: penugasanList } = usePenugasanList()
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null)

  const handleVerifySuccess = (payload: TTESignaturePayload) => {
    if (!penugasan) return
    const batchNumber = generateBANumber(penugasanList.filter((h) => h.isVerified).length)
    updatePenugasan({
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
