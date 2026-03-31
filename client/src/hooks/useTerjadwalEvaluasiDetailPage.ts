import { useState, useMemo } from 'react'
import type { TTESignaturePayload } from '@/lib/types/tte'
import {
  canVerifyBatch,
  generateBANumber,
  getSopIdsFromVerifikasiBatch,
  STATUS_SOP_AFTER_VERIFIKASI_BIRO,
} from '@/lib/domain/sop-status'
import { useVerifikasiBatchDetail, useVerifikasiBatchList } from '@/hooks/useVerifikasiBatch'
import { useSopStatus } from '@/hooks/useSopStatus'
import type { VerifikasiBatch } from '@/lib/types/terjadwal-evaluasi'
import { getInitialSopDaftarList } from '@/lib/data/sop-daftar'
import { useSopStatusStore } from '@/lib/stores/sop-status-store'

export interface UseVerifikasiBatchDetailResult {
  batch: VerifikasiBatch | null
  selectedSopId: string | null
  setSelectedSopId: (id: string | null) => void
  /** Call when TTE pin verification succeeds. Pass payload from createPinConfirmHandler. */
  handleVerifySuccess: (payload: TTESignaturePayload) => void
  canVerify: boolean
  /** Alasan verifikasi BA ditahan (mis. SOP belum semua Siap Diverifikasi). */
  verifyBlockedReason: string | null
}

/**
 * Hook untuk halaman detail Verifikasi SOP (Biro): satu terjadwal + langkah verifikasi Berita Acara (peran Biro).
 * Saat verifikasi berhasil: terjadwal jadi Terverifikasi + semua SOP di terjadwal status → Diverifikasi Biro Organisasi.
 * Pengesahan dilakukan hanya oleh Kepala OPD (halaman terpisah).
 */
export function useVerifikasiBatchDetailPage(id: string | undefined): UseVerifikasiBatchDetailResult {
  const { batch, updateBatch } = useVerifikasiBatchDetail(id)
  const { list: batchList } = useVerifikasiBatchList()
  const { setSopStatusOverride, mergeSopStatus } = useSopStatus()
  const overrides = useSopStatusStore((s) => s.overrides)
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null)

  const mergedSopDaftar = useMemo(
    () => mergeSopStatus(getInitialSopDaftarList()),
    [mergeSopStatus, overrides]
  )

  const handleVerifySuccess = (payload: TTESignaturePayload) => {
    if (!batch) return
    const batchNumber = generateBANumber(batchList.filter((h) => h.isVerified).length)
    updateBatch({
      status: 'Terverifikasi',
      isVerified: true,
      nomorBA: batchNumber,
      tanggalVerifikasi: new Date().toISOString().split('T')[0],
      namaBiro: payload.namaLengkap,
      tteSignaturePayload: payload,
    })
    const sopIds = getSopIdsFromVerifikasiBatch(batch)
    for (const sopId of sopIds) {
      setSopStatusOverride(sopId, STATUS_SOP_AFTER_VERIFIKASI_BIRO)
    }
  }

  const verifyBlockedReason = useMemo(() => {
    if (!batch || batch.isVerified || batch.status !== 'Selesai') return null
    if (canVerifyBatch(batch, mergedSopDaftar)) return null
    const byId = new Map(mergedSopDaftar.map((r) => [r.id, r.status]))
    const notReady = (batch.sopList ?? []).filter((s) => byId.get(s.id) !== 'Siap Diverifikasi')
    if (notReady.length === 0) return null
    return `Tidak dapat memverifikasi BA: ${notReady.length} SOP belum berstatus "Siap Diverifikasi". Sesuaikan status SOP di alur evaluasi terlebih dahulu.`
  }, [batch, mergedSopDaftar])

  return {
    batch,
    selectedSopId,
    setSelectedSopId,
    handleVerifySuccess,
    canVerify: batch ? canVerifyBatch(batch, mergedSopDaftar) : false,
    verifyBlockedReason,
  }
}
