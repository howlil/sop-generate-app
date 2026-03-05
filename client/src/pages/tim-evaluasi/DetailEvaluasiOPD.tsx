/**
 * Workspace evaluasi SOP per OPD.
 * Dari list OPD, klik OPD → langsung ke workspace ini: daftar SOP (kiri), preview (tengah), form evaluasi (kanan).
 */
import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Send, MessageSquare, List, FileText, Building2, Printer } from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { SOPListCard } from '@/components/sop/SOPListCard'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { RiwayatCardList } from '@/components/evaluasi/RiwayatCardList'
import { StatusHasilEvaluasiPicker } from '@/components/evaluasi/StatusHasilEvaluasiPicker'
import { SkorRatingPicker } from '@/components/evaluasi/SkorRatingPicker'
import { showToast, getRole, getRoleUserName } from '@/lib/stores/app-store'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { InfoCard } from '@/components/ui/info-card'
import { useEvaluasiDraft, getEvaluasiDraft, clearEvaluasiDraft } from '@/hooks/useEvaluasiDraft'
import { useCollapsiblePanels } from '@/hooks/useCollapsiblePanels'
import { EVALUASI_DISPLAY_STATUS_OPTIONS, STATUS_HASIL_EVALUASI } from '@/lib/constants/evaluasi'
import { ROUTES } from '@/lib/constants/routes'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'
import { getStatusSopAfterEvaluasi, isFormEvaluasiSopComplete } from '@/lib/domain/evaluasi'
import { canSelectSOPForEvaluasi, STATUS_BUKAN_LIST_EVALUASI } from '@/lib/domain/sop-evaluasi'
import { setSopStatusOverride, mergeSopStatus, subscribeSopStatus, getSopStatusOverride } from '@/lib/stores/sop-status-store'
import { formatDateId } from '@/utils/format-date'
import {
  SEED_OPD_LIST_EVALUASI,
  SEED_RIWAYAT_EVALUASI_OPD,
  SEED_RIWAYAT_EVALUASI_SOP,
  SEED_SOP_BY_OPD,
} from '@/lib/seed/penugasan-evaluasi-seed'
import { SEED_SOP_DAFTAR } from '@/lib/seed/sop-daftar'
import type { SOPDaftarItem } from '@/lib/types/sop'
import type { StatusSOP } from '@/lib/types/sop'
import { useEvaluasiLastBy } from '@/hooks/useEvaluasiLastBy'

export function DetailEvaluasiOPD() {
  const { opdId } = useParams({ from: '/tim-evaluasi/penugasan/opd/$opdId' })
  const navigate = useNavigate()
  const opd = SEED_OPD_LIST_EVALUASI.find((o) => o.id === opdId)

  const [sopList, setSopList] = useState(() => [...SEED_SOP_DAFTAR] as SOPDaftarItem[])
  useEffect(() => {
    return subscribeSopStatus(() => setSopList((prev) => [...prev]))
  }, [])

  const mergedList = useMemo(() => mergeSopStatus(sopList), [sopList])
  /** SOP OPD ini; status "Sedang Disusun" tidak masuk list evaluasi. */
  const sopsForOpd = useMemo(() => {
    if (!opd) return []
    const fromSeed = SEED_SOP_BY_OPD[opd.nama] ?? []
    return fromSeed
      .map((s) => {
        const fromStore = mergedList.find((m) => m.id === s.id)
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
  }, [opd, mergedList])

  const [lastEvaluatedBy, setLastEvaluatedBy] = useEvaluasiLastBy()

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
  const namaEvaluator = getRole() ? getRoleUserName(getRole()!) : 'Evaluator'
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

  const canEvaluateSelected = selectedSop ? canSelectSOPForEvaluasi(selectedSop.status) : false

  const [activeFormTab, setActiveFormTab] = useState<'sop' | 'opd'>('sop')
  const [ratingOPD, setRatingOPD] = useState<number | null>(null)

  const riwayatSop = effectiveSopId ? (SEED_RIWAYAT_EVALUASI_SOP[effectiveSopId] ?? []) : []
  const riwayatOpd = opd?.id ? (SEED_RIWAYAT_EVALUASI_OPD[opd.id] ?? []) : []

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
          <CollapsibleSidePanel
            side="right"
            collapsed={rightPanelCollapsed}
            onCollapsedChange={setRightPanelCollapsed}
            widthExpanded="w-[min(380px,33%)] min-w-[280px]"
            tabs={[
              { id: 'sop', label: 'Evaluasi SOP', icon: <FileText className="w-3.5 h-3.5" /> },
              { id: 'opd', label: 'Evaluasi OPD', icon: <Building2 className="w-3.5 h-3.5" /> },
            ]}
            activeTab={activeFormTab}
            onTabChange={(id) => setActiveFormTab(id as 'sop' | 'opd')}
            collapseButtonLabel="Form"
            collapseButtonIcon={<MessageSquare className="w-5 h-5" />}
          >
            <div className="p-3 space-y-4">
              {activeFormTab === 'sop' && (
                <>
                  {!effectiveSopId ? (
                    <p className="text-xs text-gray-500">Pilih SOP di daftar kiri untuk mengisi form evaluasi atau melihat riwayat.</p>
                  ) : (
                    <>
                      {/** Form hanya untuk status Diajukan Evaluasi / Sedang Dievaluasi. Selesai Evaluasi → hanya riwayat. */}
                      {!lastEvaluatedBy[effectiveSopId] && (
                        <>
                          <StatusHasilEvaluasiPicker
                            value={statusEvaluasi}
                            onChange={setStatusEvaluasi}
                            komentarTrim={komentarEvaluasi?.trim() ?? ''}
                          />
                          <FormField label="Komentar Evaluasi">
                            <Textarea
                              className="text-xs min-h-[80px]"
                              placeholder="Komentar evaluasi (wajib jika Revisi Biro)..."
                              value={komentarEvaluasi}
                              onChange={(e) => setKomentarEvaluasi(e.target.value)}
                            />
                          </FormField>
                        </>
                      )}

                      {lastEvaluatedBy[effectiveSopId] && (
                        <p className="text-[11px] text-gray-500">Evaluasi SOP ini sudah selesai. Riwayat di bawah.</p>
                      )}

                      <div className="border-t border-gray-100 pt-3">
                        <RiwayatCardList
                          title="Riwayat evaluasi SOP ini"
                          emptyMessage="Belum ada riwayat evaluasi."
                          items={riwayatSop}
                          renderItem={(r) => (
                            <>
                              <div className="flex flex-wrap items-baseline gap-x-1.5">
                                <span className="font-medium text-gray-700">{formatDateId(r.date)}</span>
                                <span className="text-gray-500">—</span>
                                <span className="text-gray-600">{r.evaluatorName}</span>
                                <span className={r.hasil === 'Sesuai' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                                  · {r.hasil}
                                </span>
                              </div>
                              {r.komentar && <p className="text-gray-600 mt-1 leading-snug">{r.komentar}</p>}
                            </>
                          )}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {activeFormTab === 'opd' && (
                <>
                  {!opd ? (
                    <p className="text-xs text-gray-500">OPD tidak tersedia.</p>
                  ) : (
                    <>
                      <SkorRatingPicker value={ratingOPD} onChange={setRatingOPD} />

                      <div className="border-t border-gray-100 pt-3">
                        <RiwayatCardList
                          title="Riwayat evaluasi OPD"
                          emptyMessage="Belum ada riwayat evaluasi OPD."
                          items={riwayatOpd}
                          renderItem={(r) => (
                            <>
                              <div className="flex flex-wrap items-baseline gap-x-1.5">
                                <span className="font-medium text-gray-700">{formatDateId(r.date)}</span>
                                <span className="text-gray-500">—</span>
                                <span className="text-gray-600">{r.evaluatorName}</span>
                                <span className="text-blue-600 font-medium">Skor {r.skor}/5</span>
                              </div>
                              {r.sopJudul && (
                                <p className="text-gray-600 mt-1 leading-snug truncate" title={r.sopJudul}>
                                  SOP: {r.sopJudul}
                                </p>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </CollapsibleSidePanel>
        }
      />

      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Kirim Hasil Evaluasi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Hanya SOP dengan status <strong>Sedang Dievaluasi</strong> (sudah diisi form) yang ditampilkan. Centang yang akan dikirim, lalu status berubah menjadi <strong>Selesai Evaluasi</strong>.
            </p>
            {sedangDievaluasiList.length === 0 ? (
              <InfoCard variant="warning">
                <p className="text-sm text-amber-800">
                  Belum ada SOP Sedang Dievaluasi. Pilih SOP dengan status <strong>Diajukan Evaluasi</strong> di daftar kiri, isi form evaluasi (status hasil + komentar jika Revisi Biro), lalu buka popup ini lagi.
                </p>
              </InfoCard>
            ) : (
              <>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-2 max-h-52 overflow-auto">
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={isSubmitCheckAll}
                        ref={(el) => {
                          if (el) el.indeterminate = isSubmitCheckAllIndeterminate
                        }}
                        onChange={(e) => setSubmitCheckAll(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Centang semua
                    </label>
                    <span className="text-[10px] text-gray-500">
                      ({submitSelectedIds.size} / {sedangDievaluasiList.length} dipilih)
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {sedangDievaluasiList.map((item) => (
                      <li key={item.id} className="flex items-start gap-2 py-1.5 border-b border-gray-100 last:border-0">
                        <input
                          type="checkbox"
                          id={`submit-sop-${item.id}`}
                          checked={submitSelectedIds.has(item.id)}
                          onChange={() => toggleSubmitSelected(item.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`submit-sop-${item.id}`} className="flex flex-col gap-0.5 cursor-pointer flex-1 min-w-0">
                          <span className="font-medium text-gray-900">{item.judul}</span>
                          <span className="text-gray-500 font-mono">{item.nomorSOP}</span>
                          <span className="text-[10px] text-blue-700 font-medium">→ {STATUS_HASIL_EVALUASI[item.statusEvaluasi]}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                <InfoCard variant="warning">
                  <p className="text-xs text-amber-800">
                    <strong>Perhatian:</strong> Setelah dikirim, hasil evaluasi tidak dapat diubah.
                  </p>
                </InfoCard>
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsSubmitOpen(false)}>
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleSubmitAll}
              disabled={sedangDievaluasiList.length === 0 || submitSelectedIds.size === 0}
            >
              <Send className="w-3.5 h-3.5" /> Ya, Kirim Hasil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
