import { useState } from 'react'
import type { TTESignaturePayload } from '@/lib/types/tte'
import {
  canVerifyPenugasan,
  generateBANumber,
  getSopIdsFromPenugasanBatch,
  STATUS_SOP_AFTER_VERIFIKASI_BIRO,
} from '@/lib/domain/sop-status'
import { usePenugasanDetail, usePenugasanList } from '@/hooks/usePenugasan'
import { useSopStatus } from '@/hooks/useSopStatus'
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
 * Saat verifikasi berhasil: penugasan jadi Terverifikasi + semua SOP di batch status → Diverifikasi Biro Organisasi.
 */
export function usePenugasanEvaluasi(id: string | undefined): UsePenugasanEvaluasiResult {
  const { penugasan, updatePenugasan } = usePenugasanDetail(id)
  const { list: penugasanList } = usePenugasanList()
  const { setSopStatusOverride } = useSopStatus()
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
    // Workflow: Biro verifikasi Berita Acara → semua SOP di batch otomatis jadi Diverifikasi Biro Organisasi
    const sopIds = getSopIdsFromPenugasanBatch(penugasan)
    for (const sopId of sopIds) {
      setSopStatusOverride(sopId, STATUS_SOP_AFTER_VERIFIKASI_BIRO)
    }
  }

  return {
    penugasan,
    selectedSopId,
    setSelectedSopId,
    handleVerifySuccess,
    canVerify: penugasan ? canVerifyPenugasan(penugasan) : false,
  }
}
