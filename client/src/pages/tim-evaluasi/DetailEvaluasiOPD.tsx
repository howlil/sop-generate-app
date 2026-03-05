/**
 * Workspace evaluasi SOP per OPD.
 * Dari list OPD, klik OPD → langsung ke workspace ini: daftar SOP (kiri), preview (tengah), form evaluasi (kanan).
 */
import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  List,
  FileText,
  Building2,
} from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { SOPListCard } from '@/components/sop/SOPListCard'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { showToast, getRole, getRoleUserName, ROLES } from '@/lib/stores'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { InfoCard } from '@/components/ui/info-card'
import { useEvaluasiDraft } from '@/hooks/useEvaluasiDraft'
import { useCollapsiblePanels } from '@/hooks/useCollapsiblePanels'
import { ROUTES } from '@/lib/constants/routes'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'
import { setSopStatusOverride, mergeSopStatus, subscribeSopStatus, getSopStatusOverride } from '@/lib/stores/sop-status-store'
import { formatDateId } from '@/utils/format-date'
import {
  SEED_LAST_EVALUATED_BY,
  SEED_OPD_LIST_EVALUASI,
  SEED_RIWAYAT_EVALUASI_OPD,
  SEED_RIWAYAT_EVALUASI_SOP,
  SEED_SOP_BY_OPD,
} from '@/lib/seed/penugasan-evaluasi-seed'
import { SEED_SOP_DAFTAR } from '@/lib/seed/sop-daftar'
import type { SOPDaftarItem } from '@/lib/types/sop'
import type { StatusSOP } from '@/lib/types/sop'
import { canSelectSOPForEvaluasi } from '@/lib/types/sop'

type EvaluasiRecord = { date: string; evaluatorName: string }
type EvaluasiRecordMap = Record<string, EvaluasiRecord>
type ParsedEvaluasiMap = Record<string, { date?: string; evaluatorName?: string }>

const EVALUASI_STORAGE_KEY = 'evaluasi_last_by'

function loadEvaluasiRecordMap(): EvaluasiRecordMap {
  const fromSeed = { ...SEED_LAST_EVALUATED_BY }
  if (typeof window === 'undefined') return fromSeed
  try {
    const raw = localStorage.getItem(EVALUASI_STORAGE_KEY)
    if (!raw) return fromSeed
    const parsed = JSON.parse(raw) as ParsedEvaluasiMap
    const fromStorage = Object.fromEntries(
      Object.entries(parsed).filter(
        ([, v]) => v && typeof v.date === 'string' && typeof v.evaluatorName === 'string'
      )
    ) as EvaluasiRecordMap
    return { ...fromSeed, ...fromStorage }
  } catch {
    return fromSeed
  }
}

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
      .filter((s) => s.status !== 'Sedang Disusun')
  }, [opd, mergedList])

  const [lastEvaluatedBy, setLastEvaluatedBy] = useState(loadEvaluasiRecordMap)
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(EVALUASI_STORAGE_KEY, JSON.stringify(lastEvaluatedBy))
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

  const handleSubmit = () => {
    if (!statusEvaluasi) {
      showToast('Silakan tetapkan status evaluasi terlebih dahulu', 'error')
      return
    }
    if (statusEvaluasi === 'Revisi Biro' && !komentarEvaluasi.trim()) {
      showToast('Status "Revisi Biro" wajib diisi komentar evaluasi', 'error')
      return
    }
    if (!effectiveSopId) return
    const newStatus: StatusSOP =
      statusEvaluasi === 'Sesuai' ? 'Dievaluasi Tim Evaluasi' : 'Revisi dari Tim Evaluasi'
    setSopStatusOverride(effectiveSopId, newStatus)
    const today = new Date().toISOString().slice(0, 10)
    setLastEvaluatedBy((prev) => ({
      ...prev,
      [effectiveSopId]: { date: today, evaluatorName: namaEvaluator },
    }))
    showToast(`Hasil evaluasi berhasil disimpan. Status SOP: ${newStatus}.`)
    setIsSubmitOpen(false)
    setTimeout(() => navigate({ to: ROUTES.TIM_EVALUASI.PENUGASAN }), 1500)
  }

  const isFormComplete =
    statusEvaluasi !== null && (statusEvaluasi !== 'Revisi Biro' || komentarEvaluasi.trim() !== '')
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

  /** Sedang Dievaluasi = SOP terpilih yang punya isian form (draft). */
  const listItems = sopsFilteredByStatusAndEvaluator.map((s) => {
    const isSelectedWithDraft =
      s.id === effectiveSopId && (statusEvaluasi != null || (komentarEvaluasi?.trim() ?? '') !== '')
    const displayStatus = isSelectedWithDraft ? 'Sedang Dievaluasi' : s.displayStatus
    return { id: s.id, nama: s.judul, nomor: s.nomorSOP, status: displayStatus }
  })

  const statusFilterOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'Diajukan Evaluasi', label: 'Diajukan Evaluasi' },
    { value: 'Sedang Dievaluasi', label: 'Sedang Dievaluasi' },
    { value: 'Selesai Evaluasi', label: 'Selesai Evaluasi' },
  ]

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
                  className="h-8 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs gap-1.5"
                  onClick={() => setIsSubmitOpen(true)}
                  disabled={!effectiveSopId || !isFormComplete || !canEvaluateSelected}
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
                  options={statusFilterOptions}
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
                    <p className="text-xs text-gray-500">Pilih SOP di daftar kiri untuk mengisi form evaluasi.</p>
                  ) : (
                    <>
                      <FormField label="Status Hasil Evaluasi" required>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            className={`p-3 rounded-md border transition-all ${
                              statusEvaluasi === 'Sesuai' ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => setStatusEvaluasi('Sesuai')}
                          >
                            <CheckCircle
                              className={`w-6 h-6 mx-auto mb-1 ${statusEvaluasi === 'Sesuai' ? 'text-green-600' : 'text-gray-400'}`}
                            />
                            <span
                              className={`text-xs font-semibold block ${statusEvaluasi === 'Sesuai' ? 'text-green-600' : 'text-gray-700'}`}
                            >
                              Sesuai
                            </span>
                            <span className="text-[10px] text-gray-500 block mt-0.5">→ Dievaluasi Tim Evaluasi</span>
                          </button>
                          <button
                            type="button"
                            className={`p-3 rounded-md border transition-all ${
                              statusEvaluasi === 'Revisi Biro' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => setStatusEvaluasi('Revisi Biro')}
                          >
                            <XCircle
                              className={`w-6 h-6 mx-auto mb-1 ${statusEvaluasi === 'Revisi Biro' ? 'text-amber-600' : 'text-gray-400'}`}
                            />
                            <span
                              className={`text-xs font-semibold block ${statusEvaluasi === 'Revisi Biro' ? 'text-amber-600' : 'text-gray-700'}`}
                            >
                              Revisi Biro
                            </span>
                            <span className="text-[10px] text-gray-500 block mt-0.5">→ Revisi dari Tim Evaluasi</span>
                          </button>
                        </div>
                        {statusEvaluasi === 'Revisi Biro' && !komentarEvaluasi.trim() && (
                          <InfoCard variant="warning" className="mt-2 flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-800">Komentar evaluasi wajib untuk status Revisi Biro.</p>
                          </InfoCard>
                        )}
                      </FormField>

                      <FormField label="Komentar Evaluasi">
                        <Textarea
                          className="text-xs min-h-[80px]"
                          placeholder="Komentar evaluasi (wajib jika Revisi Biro)..."
                          value={komentarEvaluasi}
                          onChange={(e) => setKomentarEvaluasi(e.target.value)}
                        />
                      </FormField>

                      <div className="border-t border-gray-100 pt-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">Riwayat evaluasi SOP ini</h4>
                        {riwayatSop.length === 0 ? (
                          <p className="text-[11px] text-gray-500">Belum ada riwayat evaluasi.</p>
                        ) : (
                          <div className="space-y-2">
                            {riwayatSop.map((r, i) => (
                              <Card key={i} className="rounded-md">
                                <CardContent className="p-2.5 text-[11px]">
                                  <div className="flex flex-wrap items-baseline gap-x-1.5">
                                    <span className="font-medium text-gray-700">{formatDateId(r.date)}</span>
                                    <span className="text-gray-500">—</span>
                                    <span className="text-gray-600">{r.evaluatorName}</span>
                                    <span className={r.hasil === 'Sesuai' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                                      · {r.hasil}
                                    </span>
                                  </div>
                                  {r.komentar && <p className="text-gray-600 mt-1 leading-snug">{r.komentar}</p>}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
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
                      <FormField label="Nilai evaluasi OPD (1–5)">
                        <div className="flex flex-wrap gap-1.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setRatingOPD(n)}
                              className={`w-9 h-9 rounded-md border text-sm font-semibold transition-all ${
                                ratingOPD === n
                                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">Setiap evaluasi SOP dapat disertai nilai evaluasi OPD.</p>
                      </FormField>

                      <div className="border-t border-gray-100 pt-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">Riwayat evaluasi OPD</h4>
                        {riwayatOpd.length === 0 ? (
                          <p className="text-[11px] text-gray-500">Belum ada riwayat evaluasi OPD.</p>
                        ) : (
                          <div className="space-y-2">
                            {riwayatOpd.map((r, i) => (
                              <Card key={i} className="rounded-md">
                                <CardContent className="p-2.5 text-[11px]">
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
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
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
            <DialogTitle className="text-sm">Konfirmasi Kirim Hasil Evaluasi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedSop && (
              <InfoCard variant="info">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">SOP yang dikirim</p>
                <p className="text-sm font-semibold text-gray-900">{selectedSop.judul}</p>
                <p className="text-xs text-gray-600 font-mono">{selectedSop.nomorSOP}</p>
              </InfoCard>
            )}
            <InfoCard variant={statusEvaluasi === 'Sesuai' ? 'success' : 'warning'}>
              <p className="text-xs mb-1 text-gray-700">Status SOP setelah dikirim:</p>
              <p className="text-sm font-semibold text-gray-900">
                {statusEvaluasi === 'Sesuai' ? 'Dievaluasi Tim Evaluasi' : 'Revisi dari Tim Evaluasi'}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">→ Tampil sebagai Selesai Evaluasi di daftar.</p>
            </InfoCard>
            <InfoCard variant="warning">
              <p className="text-xs text-amber-800">
                <strong>Perhatian:</strong> Setelah dikirim, hasil evaluasi tidak dapat diubah.
              </p>
            </InfoCard>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsSubmitOpen(false)}>
              Batal
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSubmit}>
              <Send className="w-3.5 h-3.5" /> Ya, Kirim Hasil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
