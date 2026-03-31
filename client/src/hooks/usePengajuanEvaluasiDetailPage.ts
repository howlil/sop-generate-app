/**
 * Hook untuk halaman detail Pengajuan Evaluasi (Biro): satu pengajuan + langkah verifikasi Berita Acara (peran Biro).
 * Per ERD-DESKRIPSI.md: PengajuanEvaluasi menggantikan konsep "VerifikasiBatch"
 * 
 * Saat verifikasi berhasil:
 * - pengajuan status → DIVERIFIKASI_BIRO
 * - semua SOP di pengajuan status → DIVERIFIKASI_BIRO_ORGANISASI
 */
import { useCallback, useMemo } from 'react'
import {
  getSopDetailIdsFromPengajuanEvaluasi,
  STATUS_SOP_AFTER_VERIFIKASI_BIRO,
} from '@/lib/domain/sop-status'
import { usePengajuanEvaluasiDetail, usePengajuanEvaluasiList } from '@/hooks/usePengajuanEvaluasi'
import type { PengajuanEvaluasi } from '@/lib/types/pengajuan-evaluasi'
import type { StatusSOP } from '@/lib/types/sop'
import { useSopStatusStore } from '@/lib/stores/sop-status-store'

export interface UsePengajuanEvaluasiDetailResult {
  pengajuan: PengajuanEvaluasi | null
  updatePengajuan: (patch: Partial<PengajuanEvaluasi>) => void
  mergedSopRows: { id: string; status: StatusSOP }[]
  handleVerify: () => Promise<void>
  isVerified: boolean
  canVerify: boolean
}

export function usePengajuanEvaluasiDetailPage(id: string | undefined): UsePengajuanEvaluasiDetailResult {
  const { pengajuan, updatePengajuan } = usePengajuanEvaluasiDetail(id)
  const { list: pengajuanList } = usePengajuanEvaluasiList()
  const { setSopStatusOverride } = useSopStatusStore()

  const mergedSopRows = useMemo(() => {
    if (!pengajuan) return []
    return (pengajuan.sopList ?? []).map((sop) => ({
      id: sop.sopDetailId,
      status: sop.hasil === 'SESUAI' ? 'SIAP_DIVERIFIKASI' : 'REVISI_DARI_TIM_EVALUASI',
    }))
  }, [pengajuan])

  const handleVerify = useCallback(async () => {
    if (!pengajuan) return
    const sopIds = getSopDetailIdsFromPengajuanEvaluasi(pengajuan)
    
    updatePengajuan({
      status: 'DIVERIFIKASI_BIRO',
      diverifikasiOlehId: 'current-user-id', // TODO: get from auth
    })

    sopIds.forEach((id) => {
      setSopStatusOverride(id, STATUS_SOP_AFTER_VERIFIKASI_BIRO)
    })
  }, [pengajuan, updatePengajuan, setSopStatusOverride])

  const isVerified = pengajuan?.status === 'DIVERIFIKASI_BIRO' || pengajuan?.status === 'DITANDATANGANI_KOORDINATOR' || pengajuan?.status === 'SELESAI'
  
  const canVerify = pengajuan?.status === 'SELESAI_DIEVALUASI' && !isVerified

  return {
    pengajuan,
    updatePengajuan,
    mergedSopRows,
    handleVerify,
    isVerified,
    canVerify,
  }
}
