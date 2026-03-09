import { useState } from 'react'
import type { TTESignaturePayload } from '@/lib/types/tte'
import {
  canVerifyBatch,
  generateBANumber,
  getSopIdsFromVerifikasiBatch,
  STATUS_SOP_AFTER_VERIFIKASI_BIRO,
} from '@/lib/domain/sop-status'
import { useVerifikasiBatchDetail, useVerifikasiBatchList } from '@/hooks/useVerifikasiBatch'
import { useSopStatus } from '@/hooks/useSopStatus'
import type { VerifikasiBatch } from '@/lib/types/verifikasi-batch'

export interface UseVerifikasiBatchDetailResult {
  batch: VerifikasiBatch | null
  selectedSopId: string | null
  setSelectedSopId: (id: string | null) => void
  /** Call when TTE pin verification succeeds. Pass payload from createPinConfirmHandler. */
  handleVerifySuccess: (payload: TTESignaturePayload) => void
  canVerify: boolean
}

/**
 * Hook untuk halaman detail Verifikasi SOP (Biro): satu batch + verifikasi Berita Acara.
 * Saat verifikasi berhasil: batch jadi Terverifikasi + semua SOP di batch status → Diverifikasi Biro Organisasi.
 */
export function useVerifikasiBatchDetailPage(id: string | undefined): UseVerifikasiBatchDetailResult {
  const { batch, updateBatch } = useVerifikasiBatchDetail(id)
  const { list: batchList } = useVerifikasiBatchList()
  const { setSopStatusOverride } = useSopStatus()
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null)

  const handleVerifySuccess = (payload: TTESignaturePayload) => {
    if (!batch) return
    const batchNumber = generateBANumber(batchList.filter((h) => h.isVerified).length)
    updateBatch({
      status: 'Terverifikasi',
      isVerified: true,
      nomorBA: batchNumber,
      tanggalVerifikasi: new Date().toISOString().split('T')[0],
      namaBiro: payload.nama,
      tteSignaturePayload: payload,
    })
    const sopIds = getSopIdsFromVerifikasiBatch(batch)
    for (const sopId of sopIds) {
      setSopStatusOverride(sopId, STATUS_SOP_AFTER_VERIFIKASI_BIRO)
    }
  }

  return {
    batch,
    selectedSopId,
    setSelectedSopId,
    handleVerifySuccess,
    canVerify: batch ? canVerifyBatch(batch) : false,
  }
}
