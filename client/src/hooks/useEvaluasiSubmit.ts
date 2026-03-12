/**
 * Hook untuk submit hasil evaluasi SOP per OPD.
 * Mengekstrak business logic dari DetailEvaluasiOPD.tsx agar testable dan reusable.
 */
import { useState, useCallback } from 'react'
import { isFormEvaluasiSopComplete, getStatusSopAfterEvaluasi } from '@/lib/domain/evaluasi'
import { clearEvaluasiDraft } from '@/hooks/useEvaluasiDraft'
import { useToast } from '@/hooks/useUI'
import { useSopStatus } from '@/hooks/useSopStatus'
import type { StatusSOP } from '@/lib/types/sop'
import { saveOpdRating, type EvaluasiRecordMap } from '@/lib/data/evaluasi-data'

export interface SedangDievaluasiItem {
  id: string
  judul: string
  nomorSOP: string
  statusEvaluasi: 'Sesuai' | 'Revisi Biro'
  komentarEvaluasi: string
}

interface UseEvaluasiSubmitParams {
  sedangDievaluasiList: SedangDievaluasiItem[]
  namaEvaluator: string
  ratingOPD: number | null
  opdId: string | undefined
  setLastEvaluatedBy: React.Dispatch<React.SetStateAction<EvaluasiRecordMap>>
  onSuccess: () => void
}

export function useEvaluasiSubmit({
  sedangDievaluasiList,
  namaEvaluator,
  ratingOPD,
  opdId,
  setLastEvaluatedBy,
  onSuccess,
}: UseEvaluasiSubmitParams) {
  const { showToast } = useToast()
  const { setSopStatusOverride } = useSopStatus()
  const [submitSelectedIds, setSubmitSelectedIds] = useState<Set<string>>(new Set())

  const isSubmitCheckAll =
    sedangDievaluasiList.length > 0 && submitSelectedIds.size === sedangDievaluasiList.length
  const isSubmitCheckAllIndeterminate =
    sedangDievaluasiList.length > 0 &&
    submitSelectedIds.size > 0 &&
    submitSelectedIds.size < sedangDievaluasiList.length

  const toggleSubmitSelected = useCallback((id: string) => {
    setSubmitSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const setSubmitCheckAll = useCallback(
    (checked: boolean) => {
      if (checked) setSubmitSelectedIds(new Set(sedangDievaluasiList.map((i) => i.id)))
      else setSubmitSelectedIds(new Set())
    },
    [sedangDievaluasiList]
  )

  const handleSubmitAll = useCallback(() => {
    const selected = sedangDievaluasiList.filter((item) => submitSelectedIds.has(item.id))
    if (selected.length === 0) {
      showToast('Pilih minimal satu SOP untuk dikirim.', 'error')
      return
    }
    const incomplete = selected.filter(
      (item) => !isFormEvaluasiSopComplete(item.statusEvaluasi, item.komentarEvaluasi)
    )
    if (incomplete.length > 0) {
      showToast(
        `Lengkapi komentar untuk SOP dengan hasil Revisi Biro: ${incomplete.map((i) => i.judul).join(', ')}`,
        'error'
      )
      return
    }
    const toSubmit = selected
    const today = new Date().toISOString().slice(0, 10)
    for (const item of toSubmit) {
      const newStatus: StatusSOP = getStatusSopAfterEvaluasi(item.statusEvaluasi)
      setSopStatusOverride(item.id, newStatus)
      setLastEvaluatedBy((prev) => ({
        ...prev,
        [item.id]: { date: today, evaluatorName: namaEvaluator },
      }))
      clearEvaluasiDraft(item.id)
    }
    if (ratingOPD !== null && opdId) {
      saveOpdRating(opdId, { skor: ratingOPD, date: today, evaluatorName: namaEvaluator })
    }
    showToast(`${toSubmit.length} hasil evaluasi berhasil dikirim. Status berubah menjadi Selesai Evaluasi.`)
    onSuccess()
  }, [
    sedangDievaluasiList,
    submitSelectedIds,
    showToast,
    setSopStatusOverride,
    setLastEvaluatedBy,
    namaEvaluator,
    ratingOPD,
    opdId,
    onSuccess,
  ])

  return {
    submitSelectedIds,
    setSubmitSelectedIds,
    isSubmitCheckAll,
    isSubmitCheckAllIndeterminate,
    toggleSubmitSelected,
    setSubmitCheckAll,
    handleSubmitAll,
  }
}
