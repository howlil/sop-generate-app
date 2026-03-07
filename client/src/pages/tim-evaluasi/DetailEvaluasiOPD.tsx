/**
 * Workspace evaluasi SOP per OPD.
 * Dari list OPD, klik OPD → langsung ke workspace ini: daftar SOP (kiri), preview (tengah), form evaluasi (kanan).
 */
import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Send, List, Printer } from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { SOPListCard } from '@/components/sop/SOPListCard'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { useEvaluasiDraft, getEvaluasiDraft, clearEvaluasiDraft } from '@/hooks/useEvaluasiDraft'
import { EVALUASI_DISPLAY_STATUS_OPTIONS } from '@/lib/constants/evaluasi'
import { ROUTES } from '@/lib/constants/routes'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'
import { getStatusSopAfterEvaluasi, isFormEvaluasiSopComplete } from '@/lib/domain/evaluasi'
import { STATUS_BUKAN_LIST_EVALUASI } from '@/lib/domain/sop-evaluasi'
import { useToast, useCollapsiblePanels } from '@/hooks/useUI'
import { useAppRole } from '@/hooks/useAppRole'
import { useSopStatus } from '@/hooks/useSopStatus'
import { formatDateId } from '@/utils/format-date'
import {
  getOpdListEvaluasi,
  getSopByOpd,
  getRiwayatEvaluasiOpd,
  getRiwayatEvaluasiSop,
  getLastEvaluatedByInitial,
} from '@/lib/data/penugasan-evaluasi'
import { getInitialSopDaftarList } from '@/lib/data/sop-daftar'
import type { SOPDaftarItem } from '@/lib/types/sop'
import type { StatusSOP } from '@/lib/types/sop'
import { EVALUASI_STORAGE_KEY } from '@/lib/constants/evaluasi'
import { DetailEvaluasiOPDSubmitDialog } from './detail-evaluasi-opd/DetailEvaluasiOPDSubmitDialog'
import { DetailEvaluasiOPDFormPanel } from './detail-evaluasi-opd/DetailEvaluasiOPDFormPanel'

type EvaluasiRecordMap = Record<string, { date: string; evaluatorName: string }>

function loadEvaluasiRecordMap(): EvaluasiRecordMap {
  const fromSeed = getLastEvaluatedByInitial()
  if (typeof window === 'undefined') return fromSeed
  try {
    const raw = localStorage.getItem(EVALUASI_STORAGE_KEY)
    if (!raw) return fromSeed
    const parsed = JSON.parse(raw) as Record<string, { date?: string; evaluatorName?: string }>
    const fromStorage = Object.fromEntries(
      Object.entries(parsed).filter(
        ([, v]) => v && typeof v.date === 'string' && typeof v.evaluatorName === 'string'
      )
    ) as EvaluasiRecordMap
    const merged: EvaluasiRecordMap = { ...fromSeed }
    for (const [id, v] of Object.entries(fromStorage)) {
      if (!(id in fromSeed)) merged[id] = v
    }
    return merged
  } catch {
    return fromSeed
  }
}

export function DetailEvaluasiOPD() {
  const { opdId } = useParams({ from: '/tim-evaluasi/penugasan/opd/$opdId' })
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { role, getRoleUserName } = useAppRole()
  const { mergeSopStatus, setSopStatusOverride, getSopStatusOverride } = useSopStatus()
  const opdListEvaluasi = getOpdListEvaluasi()
  const opd = opdListEvaluasi.find((o) => o.id === opdId)
  const sopByOpd = getSopByOpd()
  const riwayatEvaluasiOpd = getRiwayatEvaluasiOpd()
  const riwayatEvaluasiSop = getRiwayatEvaluasiSop()

  const [sopList] = useState(() => getInitialSopDaftarList() as SOPDaftarItem[])
  const mergedSopList = useMemo(() => mergeSopStatus(sopList), [sopList, mergeSopStatus])

  /** SOP OPD ini; status "Sedang Disusun" tidak masuk list evaluasi. */
  const sopsForOpd = useMemo(() => {
    if (!opd) return []
    const fromSeed = sopByOpd[opd.nama] ?? []
    return fromSeed
      .map((s) => {
        const fromStore = mergedSopList.find((m) => m.id === s.id)
        if (fromStore) {
          return {
            id: fromStore.id,
            judul: fromStore.judul,
            nomorSOP: fromStore.nomorSOP,
            status: getSopStatusOverride(fromStore.id) ?? fromStore.status,
          }
        }
        return {
          id: s.id,
          judul: s.nama,
          nomorSOP: s.nomor,
          status: s.status,
        }
      })
      .filter((s) => s.status !== STATUS_BUKAN_LIST_EVALUASI)
  }, [opd, mergedSopList, mergeSopStatus, getSopStatusOverride])

  const [lastEvaluatedBy, setLastEvaluatedBy] = useState<EvaluasiRecordMap>(loadEvaluasiRecordMap)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const initial = getLastEvaluatedByInitial()
    const toPersist = Object.fromEntries(
      Object.entries(lastEvaluatedBy).filter(([id]) => !(id in initial))
    )
    localStorage.setItem(EVALUASI_STORAGE_KEY, JSON.stringify(toPersist))
  }, [lastEvaluatedBy])

  /** Di workspace evaluasi: Diajukan Evaluasi (belum dikirim), Selesai Evaluasi (sudah dikirim hasil). */
  const sopsForOpdWithDisplayStatus = useMemo(
    () =>
      sopsForOpd.map((s) => ({
        ...s,
        displayStatus: lastEvaluatedBy[s.id] ? ('Selesai Evaluasi' as const) : ('Diajukan Evaluasi' as const),
      })),
    [sopsForOpd, lastEvaluatedBy]
  )

  const [filterStatusLeft, setFilterStatusLeft] = useState('all' as string)
  const sopsFilteredByStatus = useMemo(() => {
    if (filterStatusLeft === 'all') return sopsForOpdWithDisplayStatus
    return sopsForOpdWithDisplayStatus.filter((s) => s.displayStatus === filterStatusLeft)
  }, [sopsForOpdWithDisplayStatus, filterStatusLeft])

  const [filterEvaluator, setFilterEvaluator] = useState('all' as string)
  const uniqueEvaluatorNames = useMemo(() => {
    const names = new Set(Object.values(lastEvaluatedBy).map((v) => v.evaluatorName))
    return Array.from(names).sort()
  }, [lastEvaluatedBy])
  const evaluatorFilterOptions = useMemo(
    () => [
      { value: 'all', label: 'Semua evaluator' },
      ...uniqueEvaluatorNames.map((n) => ({ value: n, label: n })),
    ],
    [uniqueEvaluatorNames]
  )

  const sopsFilteredByStatusAndEvaluator = useMemo(() => {
    if (filterEvaluator === 'all') return sopsFilteredByStatus
    return sopsFilteredByStatus.filter(
      (s) => lastEvaluatedBy[s.id]?.evaluatorName === filterEvaluator
    )
  }, [sopsFilteredByStatus, filterEvaluator, lastEvaluatedBy])

  const firstSopId = sopsFilteredByStatusAndEvaluator[0]?.id ?? null
  const [selectedSopId, setSelectedSopId] = useState(null as string | null)
  const effectiveSopId = selectedSopId ?? firstSopId
  const selectedSop = sopsForOpd.find((s) => s.id === effectiveSopId)

  useEffect(() => {
    const stillInList = sopsFilteredByStatusAndEvaluator.some((s) => s.id === effectiveSopId)
    if (!stillInList && sopsFilteredByStatusAndEvaluator.length > 0) {
      setSelectedSopId(sopsFilteredByStatusAndEvaluator[0].id)
    } else if (!stillInList) {
      setSelectedSopId(null)
    }
  }, [sopsFilteredByStatusAndEvaluator, effectiveSopId])

  const {
    komentarEvaluasi,
    setKomentarEvaluasi,
    statusEvaluasi,
    setStatusEvaluasi,
  } = useEvaluasiDraft(effectiveSopId ?? undefined)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  /** Id SOP yang dicentang di popup Kirim (hanya list Sedang Dievaluasi). */
  const [submitSelectedIds, setSubmitSelectedIds] = useState<Set<string>>(new Set())

  const isFormComplete = isFormEvaluasiSopComplete(statusEvaluasi, komentarEvaluasi ?? '')
  const namaEvaluator = role ? getRoleUserName(role) : 'Evaluator'
  const lastEvaluatedEntry = effectiveSopId ? lastEvaluatedBy[effectiveSopId] : undefined
  const tanggalTerakhirEvaluasi = lastEvaluatedEntry ? lastEvaluatedEntry.date : null
  /** Evaluator yang terakhir mengevaluasi SOP terpilih (per SOP bisa beda) */
  const evaluatorSopTerpilih = lastEvaluatedEntry?.evaluatorName ?? null

  const {
    leftCollapsed: leftPanelCollapsed,
    setLeftCollapsed: setLeftPanelCollapsed,
    rightCollapsed: rightPanelCollapsed,
    setRightCollapsed: setRightPanelCollapsed,
  } = useCollapsiblePanels()

  /** Daftar SOP dengan status Sedang Dievaluasi (punya draft lengkap), untuk tampil di popup & kirim sekaligus. */
  const sedangDievaluasiList = useMemo(() => {
    const out: Array<{ id: string; judul: string; nomorSOP: string; statusEvaluasi: 'Sesuai' | 'Revisi Biro'; komentarEvaluasi: string }> = []
    for (const s of sopsFilteredByStatusAndEvaluator) {
      if (s.displayStatus === 'Selesai Evaluasi') continue
      if (s.id === effectiveSopId) {
        if (isFormComplete && statusEvaluasi) {
          out.push({
            id: s.id,
            judul: s.judul,
            nomorSOP: s.nomorSOP,
            statusEvaluasi,
            komentarEvaluasi: komentarEvaluasi?.trim() ?? '',
          })
        }
        continue
      }
      const draft = getEvaluasiDraft(s.id)
      if (draft?.statusEvaluasi) {
        out.push({
          id: s.id,
          judul: s.judul,
          nomorSOP: s.nomorSOP,
          statusEvaluasi: draft.statusEvaluasi,
          komentarEvaluasi: draft.komentarEvaluasi ?? '',
        })
      }
    }
    return out
  }, [sopsFilteredByStatusAndEvaluator, effectiveSopId, isFormComplete, statusEvaluasi, komentarEvaluasi])

  useEffect(() => {
    if (isSubmitOpen && sedangDievaluasiList.length > 0) {
      setSubmitSelectedIds(new Set(sedangDievaluasiList.map((i) => i.id)))
    }
  }, [isSubmitOpen, sedangDievaluasiList])

  const toggleSubmitSelected = (id: string) => {
    setSubmitSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const isSubmitCheckAll = sedangDievaluasiList.length > 0 && submitSelectedIds.size === sedangDievaluasiList.length
  const isSubmitCheckAllIndeterminate =
    sedangDievaluasiList.length > 0 && submitSelectedIds.size > 0 && submitSelectedIds.size < sedangDievaluasiList.length
  const setSubmitCheckAll = (checked: boolean) => {
    if (checked) setSubmitSelectedIds(new Set(sedangDievaluasiList.map((i) => i.id)))
    else setSubmitSelectedIds(new Set())
  }

  const handleSubmitAll = () => {
    const toSubmit = sedangDievaluasiList.filter((item) => submitSelectedIds.has(item.id))
    if (toSubmit.length === 0) {
      showToast('Pilih minimal satu SOP untuk dikirim.', 'error')
      return
    }
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
    showToast(`${toSubmit.length} hasil evaluasi berhasil dikirim. Status berubah menjadi Selesai Evaluasi.`)
    setIsSubmitOpen(false)
    setTimeout(() => navigate({ to: ROUTES.TIM_EVALUASI.PENUGASAN }), 1500)
  }

  const [activeFormTab, setActiveFormTab] = useState<'sop' | 'opd'>('sop')
  const [ratingOPD, setRatingOPD] = useState<number | null>(null)

  const riwayatSop = effectiveSopId ? (riwayatEvaluasiSop[effectiveSopId] ?? []) : []
  const riwayatOpd = opd?.id ? (riwayatEvaluasiOpd[opd.id] ?? []) : []

  if (!opd) {
    return (
      <DetailPageLayout
        breadcrumb={[{ label: 'Evaluasi SOP', to: ROUTES.TIM_EVALUASI.PENUGASAN }]}
        title="Evaluasi SOP"
        description=""
        backTo={ROUTES.TIM_EVALUASI.PENUGASAN}
        main={<p className="p-4 text-sm text-gray-600">OPD tidak ditemukan.</p>}
      />
    )
  }

  /** Sedang Dievaluasi = SOP terpilih yang punya isian form (draft). Selesai Evaluasi tetap dikunci, tidak berubah. */
  const listItems = sopsFilteredByStatusAndEvaluator.map((s) => {
    const isSelectedWithDraft =
      s.id === effectiveSopId && (statusEvaluasi != null || (komentarEvaluasi?.trim() ?? '') !== '')
    const displayStatus =
      s.displayStatus === 'Selesai Evaluasi'
        ? 'Selesai Evaluasi'
        : isSelectedWithDraft
          ? 'Sedang Dievaluasi'
          : s.displayStatus
    return { id: s.id, nama: s.judul, nomor: s.nomorSOP, status: displayStatus }
  })

  return (
    <>
      <DetailPageLayout
        breadcrumb={[
          { label: 'Evaluasi SOP', to: ROUTES.TIM_EVALUASI.PENUGASAN },
          { label: opd.nama },
        ]}
        title={`Evaluasi SOP — ${opd.nama}`}
        description="Pilih SOP di daftar kiri, isi form evaluasi di panel kanan."
        backTo={ROUTES.TIM_EVALUASI.PENUGASAN}
        backSize="icon"
        header={
          <>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">Workspace Evaluasi SOP</h2>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50"
                  onClick={() => window.print()}
                >
                  <Printer className="w-3.5 h-3.5" /> Print SOP
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs gap-1.5"
                  onClick={() => setIsSubmitOpen(true)}
                >
                  <Send className="w-3.5 h-3.5" /> Kirim Hasil Evaluasi
                </Button>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-gray-700">
              <span>
                <span className="text-gray-500">Evaluator (SOP ini):</span>{' '}
                <span className="font-medium">{evaluatorSopTerpilih ?? '—'}</span>
              </span>
              <span>
                <span className="text-gray-500">Terakhir evaluasi:</span>{' '}
                {tanggalTerakhirEvaluasi ? formatDateId(tanggalTerakhirEvaluasi) : '—'}
              </span>
            </div>
          </>
        }
        leftPanel={
          <CollapsibleSidePanel
            side="left"
            collapsed={leftPanelCollapsed}
            onCollapsedChange={setLeftPanelCollapsed}
            widthExpanded="w-[min(240px,20%)] min-w-[180px]"
            title="Daftar SOP"
            subtitle={`${listItems.length} dokumen`}
            collapseButtonLabel="Daftar"
            collapseButtonIcon={<List className="w-5 h-5" />}
          >
            <div className="flex flex-col h-full min-h-0">
              <div className="p-2 border-b border-gray-100 flex flex-row flex-nowrap gap-1.5 flex-shrink-0">
                <Select
                  className="flex-1 min-w-0 h-8 text-xs"
                  value={filterStatusLeft}
                  onValueChange={setFilterStatusLeft}
                  options={[...EVALUASI_DISPLAY_STATUS_OPTIONS]}
                  aria-label="Filter by status"
                  title="Filter by status"
                />
                <Select
                  className="flex-1 min-w-0 h-8 text-xs"
                  value={filterEvaluator}
                  onValueChange={setFilterEvaluator}
                  options={evaluatorFilterOptions}
                  aria-label="Filter by evaluator"
                  title="Filter by evaluator"
                />
              </div>
              <div className="flex-1 min-h-0 overflow-auto">
                <SOPListCard
                  items={listItems}
                  selectedId={effectiveSopId}
                  onSelect={setSelectedSopId}
                  statusDomain={STATUS_DOMAIN.SOP}
                  variant="compact"
                />
              </div>
            </div>
          </CollapsibleSidePanel>
        }
        main={
          <div className="flex flex-col h-full">
            <div className="p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h3 className="text-xs font-semibold text-gray-700">Preview SOP</h3>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              {selectedSop ? (
                <SOPPreviewTemplate name={selectedSop.judul} number={selectedSop.nomorSOP} />
              ) : (
                <div className="flex items-center justify-center flex-1 text-xs text-gray-400">
                  Pilih SOP di daftar kiri
                </div>
              )}
            </div>
          </div>
        }
        rightPanel={
          <DetailEvaluasiOPDFormPanel
            opd={opd}
            collapsed={rightPanelCollapsed}
            onCollapsedChange={setRightPanelCollapsed}
            activeFormTab={activeFormTab}
            onTabChange={setActiveFormTab}
            effectiveSopId={effectiveSopId}
            lastEvaluatedBy={lastEvaluatedBy}
            statusEvaluasi={statusEvaluasi}
            setStatusEvaluasi={setStatusEvaluasi}
            komentarEvaluasi={komentarEvaluasi ?? ''}
            setKomentarEvaluasi={setKomentarEvaluasi}
            riwayatSop={riwayatSop}
            riwayatOpd={riwayatOpd}
            ratingOPD={ratingOPD}
            setRatingOPD={setRatingOPD}
          />
        }
      />

      <DetailEvaluasiOPDSubmitDialog
        open={isSubmitOpen}
        onOpenChange={setIsSubmitOpen}
        sedangDievaluasiList={sedangDievaluasiList}
        submitSelectedIds={submitSelectedIds}
        toggleSubmitSelected={toggleSubmitSelected}
        isSubmitCheckAll={isSubmitCheckAll}
        isSubmitCheckAllIndeterminate={isSubmitCheckAllIndeterminate}
        setSubmitCheckAll={setSubmitCheckAll}
        onConfirm={handleSubmitAll}
      />
    </>
  )
}
