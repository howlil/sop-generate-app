/**
 * Kepala OPD: Berita Acara.
 * 1. Tampilan awal: tabel daftar Berita Acara.
 * 2. Setelah pilih "Lihat detail": struktur sama dengan Biro (header info, kiri daftar SOP, tengah preview BA, kanan Catatan & Rekomendasi).
 */
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FileText, PenLine, Eye, List, Printer, Calendar, MessageSquare, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { EmptyState } from '@/components/ui/empty-state'
import { PinVerificationDialog } from '@/components/tte/PinVerificationDialog'
import { BeritaAcaraTemplate } from '@/components/berita-acara/BeritaAcaraTemplate'
import { SOPListCard } from '@/components/sop/SOPListCard'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { InfoField, InfoGrid } from '@/components/ui/info-field'
import { RiwayatCardList } from '@/components/evaluasi/RiwayatCardList'
import { useTTESignature } from '@/hooks/useTTESignature'
import { useVerifikasiBatchList } from '@/hooks/useVerifikasiBatch'
import { useSopStatus } from '@/hooks/useSopStatus'
import { useToast } from '@/hooks/useUI'
import { canKepalaOpdSignSop } from '@/lib/domain/sop-status'
import type { StatusSOP } from '@/lib/types/sop'
import { getKepalaOPDOpdId } from '@/lib/data/role-display'
import { useOpdList } from '@/lib/data/opd'
import { getRiwayatEvaluasiSop } from '@/lib/data/evaluasi-data'
import { formatDateId, formatDateIdLong } from '@/utils/format-date'
import { ROUTES } from '@/lib/constants/routes'
import { Route } from '@/routes/kepala-opd.berita-acara'

export function BeritaAcaraPage() {
  const navigate = useNavigate()
  const { id: searchId } = Route.useSearch()
  const opdId = getKepalaOPDOpdId()
  const opds = useOpdList()
  const opdName = opds.find((o) => o.id === opdId)?.name ?? ''
  const { list: batchList, updateBatch } = useVerifikasiBatchList()
  const { showToast } = useToast()
  const { getSopStatusOverride, setSopStatusOverride } = useSopStatus()
  const [signingBatchId, setSigningBatchId] = useState<string | null>(null)
  const [signingSopId, setSigningSopId] = useState<string | null>(null)
  const selectedBaId = searchId ?? null
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null)
  const [previewMainTab, setPreviewMainTab] = useState<'sop' | 'ba'>('ba')

  const goToDetail = (baId: string) => navigate({ to: ROUTES.KEPALA_OPD.BERITA_ACARA, search: { id: baId } })

  const baMenungguTTD = useMemo(
    () =>
      batchList.filter(
        (p) => p.opd === opdName && p.isVerified === true && p.isSignedByKepalaOPD !== true
      ),
    [batchList, opdName]
  )

  /** BA yang dipilih (dari semua batch OPD) agar setelah TTD BA tetap bisa tampil & TTD SOP. */
  const selectedBa = useMemo(
    () =>
      selectedBaId
        ? batchList.find((p) => p.opd === opdName && p.id === selectedBaId) ?? null
        : null,
    [batchList, opdName, selectedBaId]
  )

  const sopList = selectedBa?.sopList ?? []
  const firstSopId = sopList[0]?.id ?? null
  const effectiveSopId = selectedSopId ?? firstSopId
  const displaySop = sopList.find((s) => s.id === effectiveSopId) ?? null

  useEffect(() => {
    setSelectedSopId(null)
  }, [selectedBaId])

  const signingBatch = useMemo(
    () => (signingBatchId ? batchList.find((p) => p.id === signingBatchId) : null),
    [batchList, signingBatchId]
  )

  const tte = useTTESignature({
    role: 'kepala-opd',
    documentId: signingBatch ? `berita-acara-${signingBatch.id}` : undefined,
  })

  const handlePinConfirm = tte.createPinConfirmHandler(
    {
      documentLabel: `Berita Acara ${signingBatch?.nomorBA ?? ''}`,
      referenceId: signingBatch?.nomorBA ?? signingBatch?.id ?? '',
    },
    () => {
      if (!signingBatchId) return
      const today = new Date().toISOString().split('T')[0]
      updateBatch(signingBatchId, {
        isSignedByKepalaOPD: true,
        tanggalTTDBaByOpd: today,
      })
      showToast('Berita Acara berhasil ditandatangani. Anda dapat mengesahkan masing-masing SOP di bawah.')
      setSigningBatchId(null)
    }
  )

  const openSignDialog = (id: string) => setSigningBatchId(id)
  const closeSignDialog = () => setSigningBatchId(null)
  const openSignSopDialog = (sopId: string) => setSigningSopId(sopId)
  const closeSignSopDialog = () => setSigningSopId(null)

  const tteSop = useTTESignature({
    role: 'kepala-opd',
    documentId: signingSopId ?? undefined,
  })
  const signingSop =
    signingSopId && displaySop?.id === signingSopId ? displaySop : null
  const handleSignSopConfirm = tteSop.createPinConfirmHandler(
    {
      documentLabel: signingSop?.nama ?? 'SOP',
      referenceId: signingSop?.nomor ?? signingSopId ?? '',
    },
    () => {
      if (signingSopId) {
        setSopStatusOverride(signingSopId, 'Berlaku')
        showToast('SOP berhasil disahkan dengan TTE BSRE.')
        setSigningSopId(null)
      }
    }
  )

  // ——— Tampilan: tidak ada BA ———
  if (baMenungguTTD.length === 0) {
    return (
      <ListPageLayout
        breadcrumb={[{ label: 'Berita Acara' }]}
        title="Berita Acara"
        description="Berita Acara milik OPD Anda yang sudah diverifikasi Biro dan menunggu tanda tangan Anda."
      >
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <EmptyState
            icon={<FileText />}
            title="Tidak ada Berita Acara menunggu tanda tangan"
            description="Semua Berita Acara OPD Anda sudah ditandatangani, atau belum ada BA yang diverifikasi Biro."
          />
        </div>
      </ListPageLayout>
    )
  }

  // ——— Tampilan: tabel daftar BA (belum pilih detail) ———
  if (selectedBaId === null) {
    return (
      <>
        <ListPageLayout
          breadcrumb={[{ label: 'Berita Acara' }]}
          title="Berita Acara"
          description="Daftar Berita Acara yang sudah diverifikasi Biro. Klik Lihat detail untuk melihat dokumen BA dan daftar SOP yang diverifikasi, lalu tandatangani bila siap."
        >
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table.Root>
              <Table.Table>
                <thead>
                  <Table.HeadRow>
                    <Table.Th>Nomor BA</Table.Th>
                    <Table.Th>Tanggal verifikasi Biro</Table.Th>
                    <Table.Th>Jumlah SOP</Table.Th>
                    <Table.Th>Aksi</Table.Th>
                  </Table.HeadRow>
                </thead>
                <tbody>
                  {baMenungguTTD.map((p) => (
                    <Table.BodyRow key={p.id}>
                      <Table.Td className="font-medium">{p.nomorBA ?? '-'}</Table.Td>
                      <Table.Td>
                        {p.tanggalVerifikasi
                          ? formatDateIdLong(p.tanggalVerifikasi + 'T00:00:00')
                          : '-'}
                      </Table.Td>
                      <Table.Td>{(p.sopList ?? []).length} SOP</Table.Td>
                      <Table.Td>
                        <div className="flex items-center gap-1">
                          <IconActionButton
                            icon={Eye}
                            title="Lihat detail"
                            onClick={() => goToDetail(p.id)}
                          />
                          <IconActionButton
                            icon={PenLine}
                            title={!tte.canSign ? 'Setup TTE terlebih dahulu' : 'Tandatangani Berita Acara'}
                            onClick={() => openSignDialog(p.id)}
                            disabled={!tte.canSign}
                          />
                        </div>
                      </Table.Td>
                    </Table.BodyRow>
                  ))}
                </tbody>
              </Table.Table>
            </Table.Root>
          </div>
        </ListPageLayout>

        <PinVerificationDialog
          open={signingBatchId !== null}
          onOpenChange={(open) => !open && closeSignDialog()}
          title="Tandatangani Berita Acara"
          description="Masukkan PIN TTE BSRE untuk menandatangani Berita Acara. Setelah ini Anda dapat mengesahkan masing-masing SOP di detail Berita Acara (tab Preview SOP) atau di Pantau SOP."
          confirmLabel="Tandatangani"
          onConfirm={handlePinConfirm}
        />
      </>
    )
  }

  // ——— Tampilan: detail BA — struktur sama dengan Biro (header info, kiri daftar SOP, tengah BA, kanan Catatan & Rekomendasi) ———
  const riwayatEvaluasiSop = getRiwayatEvaluasiSop()
  const riwayatSop = effectiveSopId ? (riwayatEvaluasiSop[effectiveSopId] ?? []) : []
  const sopStatusForDisplay: StatusSOP | undefined = displaySop
    ? (getSopStatusOverride(displaySop.id) ?? displaySop.status) as StatusSOP
    : undefined
  const canSignSop =
    !!selectedBa?.isSignedByKepalaOPD &&
    !!displaySop &&
    !!sopStatusForDisplay &&
    canKepalaOpdSignSop(sopStatusForDisplay, batchList, opdName, displaySop.id, displaySop.nomor) &&
    tteSop.canSign
  const firstSignableSop = useMemo(
    () =>
      selectedBa?.isSignedByKepalaOPD && tteSop.canSign
        ? sopList.find((s) => {
            const st = (getSopStatusOverride(s.id) ?? s.status) as StatusSOP
            return canKepalaOpdSignSop(st, batchList, opdName, s.id, s.nomor)
          })
        : null,
    [selectedBa?.isSignedByKepalaOPD, tteSop.canSign, sopList, batchList, opdName, getSopStatusOverride]
  )
  const hasAnySignableSop = !!firstSignableSop

  return (
    <>
      <DetailPageLayout
        breadcrumb={[
          { label: 'Berita Acara', to: ROUTES.KEPALA_OPD.BERITA_ACARA },
          { label: selectedBa?.nomorBA ?? 'Detail' },
        ]}
        title={`Detail Berita Acara — ${selectedBa?.nomorBA ?? ''}`}
        description={
          selectedBa?.isSignedByKepalaOPD
            ? 'Berita Acara sudah ditandatangani. Pilih SOP di kiri lalu gunakan tombol Mengesahkan SOP untuk mengesahkan masing-masing.'
            : 'Informasi OPD & evaluasi. Tandatangani Berita Acara terlebih dahulu, lalu Anda dapat mengesahkan masing-masing SOP.'
        }
        backTo={ROUTES.KEPALA_OPD.BERITA_ACARA}
        backSize="icon"
        header={
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-semibold text-gray-900">Informasi OPD & Evaluasi</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => window.print()}
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Berita Acara
                </Button>
                {!selectedBa?.isSignedByKepalaOPD ? (
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-blue-500 text-white hover:bg-blue-600"
                    disabled={!tte.canSign}
                    title={!tte.canSign ? 'Setup TTE terlebih dahulu' : 'Tandatangani Berita Acara'}
                    onClick={() => selectedBa && openSignDialog(selectedBa.id)}
                  >
                    <PenLine className="w-3.5 h-3.5" /> Tandatangani Berita Acara
                  </Button>
                ) : (
                  hasAnySignableSop && firstSignableSop && (
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                      title="Mengesahkan SOP (TTE) — pilih SOP di kiri bila perlu"
                      onClick={() => {
                        setPreviewMainTab('sop')
                        if (!displaySop || !canSignSop) setSelectedSopId(firstSignableSop.id)
                        openSignSopDialog(canSignSop && displaySop ? displaySop.id : firstSignableSop.id)
                      }}
                    >
                      <FileCheck className="w-3.5 h-3.5" /> Mengesahkan SOP
                    </Button>
                  )
                )}
              </div>
            </div>
            {selectedBa && (
              <div className="pt-2 space-y-2">
                <span className="text-xs font-medium text-gray-900">{selectedBa.opd}</span>
                <InfoGrid cols={4}>
                  {selectedBa.timEvaluasi && (
                    <InfoField label="Evaluator:">{selectedBa.timEvaluasi}</InfoField>
                  )}
                  {selectedBa.tanggalEvaluasi && (
                    <InfoField label="Tgl Evaluasi:" icon={<Calendar />}>
                      {formatDateId(selectedBa.tanggalEvaluasi)}
                    </InfoField>
                  )}
                  {selectedBa.tanggalVerifikasi && (
                    <InfoField label="Tgl Verifikasi:" icon={<Calendar />}>
                      {formatDateId(selectedBa.tanggalVerifikasi)}
                    </InfoField>
                  )}
                  {selectedBa.nomorBA && (
                    <InfoField label="Nomor BA:">{selectedBa.nomorBA}</InfoField>
                  )}
                </InfoGrid>
              </div>
            )}
          </>
        }
        leftPanel={
          <CollapsibleSidePanel
            side="left"
            collapsed={leftPanelCollapsed}
            onCollapsedChange={setLeftPanelCollapsed}
            widthExpanded="w-[min(240px,20%)] min-w-[180px]"
            title="Daftar SOP"
            subtitle={`${sopList.length} dokumen`}
            collapseButtonLabel="Daftar"
            collapseButtonIcon={<List className="w-5 h-5" />}
          >
            <SOPListCard
              items={sopList.map((s) => ({ id: s.id, nama: s.nama, nomor: s.nomor, status: s.status }))}
              selectedId={effectiveSopId}
              onSelect={setSelectedSopId}
            />
          </CollapsibleSidePanel>
        }
        main={
          <div className="flex flex-col h-full">
            <div className="p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMainTab('sop')}
                className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${previewMainTab === 'sop' ? 'bg-white border border-gray-200 text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Preview SOP
              </button>
              <button
                type="button"
                onClick={() => setPreviewMainTab('ba')}
                className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${previewMainTab === 'ba' ? 'bg-white border border-gray-200 text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Berita Acara
              </button>
            </div>
            <div className="flex-1 min-h-0 flex flex-col overflow-auto scrollbar-hide">
              {previewMainTab === 'sop' ? (
                displaySop ? (
                  <div className="flex flex-col h-full">
                    <div className="flex-shrink-0 flex items-center justify-end gap-2 p-2 border-b border-gray-100 bg-gray-50">
                      {canSignSop && (
                        <Button
                          size="sm"
                          className="h-8 text-xs gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={() => openSignSopDialog(displaySop.id)}
                        >
                          <FileCheck className="w-3.5 h-3.5" /> Mengesahkan SOP
                        </Button>
                      )}
                    </div>
                    <div className="flex-1 min-h-0 overflow-auto scrollbar-hide">
                      <SOPPreviewTemplate name={displaySop.nama} number={displaySop.nomor} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-1 text-xs text-gray-400">
                    Pilih SOP di daftar kiri
                  </div>
                )
              ) : selectedBa ? (
                <div className="p-4 overflow-auto scrollbar-hide">
                  <BeritaAcaraTemplate
                    opd={selectedBa.opd}
                    nomorBA={selectedBa.nomorBA}
                    tanggalVerifikasi={selectedBa.tanggalVerifikasi}
                    sopList={sopList.map((s) => ({ nomor: s.nomor, nama: s.nama }))}
                    evaluator={selectedBa.timEvaluasi}
                    namaBiro={selectedBa.namaBiro}
                    tteSignaturePayload={selectedBa.tteSignaturePayload}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center flex-1 text-xs text-gray-400">
                  Pilih Berita Acara di daftar
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
            widthExpanded="w-[min(320px,33%)] min-w-[220px]"
            title="Catatan & Rekomendasi"
            subtitle={effectiveSopId ? 'Riwayat evaluasi SOP' : undefined}
            collapseButtonLabel="Catatan"
            collapseButtonIcon={<MessageSquare className="w-5 h-5" />}
          >
            <div className="p-3 space-y-4">
              {!effectiveSopId ? (
                <p className="text-xs text-gray-500">
                  Pilih SOP di daftar kiri untuk melihat riwayat hasil evaluasi.
                </p>
              ) : (
                <RiwayatCardList
                  title="Riwayat hasil evaluasi SOP ini"
                  emptyMessage="Belum ada riwayat evaluasi SOP ini."
                  items={riwayatSop}
                  renderItem={(r) => (
                    <>
                      <div className="flex flex-wrap items-baseline gap-x-1.5">
                        <span className="font-medium text-gray-700">{formatDateId(r.date)}</span>
                        <span className="text-gray-500">—</span>
                        <span className="text-gray-600">{r.evaluatorName}</span>
                        <span
                          className={
                            r.hasil === 'Sesuai'
                              ? 'text-green-600 font-medium'
                              : 'text-amber-600 font-medium'
                          }
                        >
                          · {r.hasil}
                        </span>
                      </div>
                      {r.komentar && (
                        <p className="text-gray-600 mt-1 leading-snug">{r.komentar}</p>
                      )}
                    </>
                  )}
                />
              )}
            </div>
          </CollapsibleSidePanel>
        }
      />

      <PinVerificationDialog
        open={signingBatchId !== null}
        onOpenChange={(open) => !open && closeSignDialog()}
        title="Tandatangani Berita Acara"
        description="Masukkan PIN TTE BSRE untuk menandatangani Berita Acara. Setelah ini Anda dapat mengesahkan masing-masing SOP di bawah."
        confirmLabel="Tandatangani"
        onConfirm={handlePinConfirm}
      />
      <PinVerificationDialog
        open={signingSopId !== null}
        onOpenChange={(open) => !open && closeSignSopDialog()}
        title="Mengesahkan SOP"
        description="Masukkan PIN TTE BSRE untuk mengesahkan SOP ini (status menjadi Berlaku)."
        confirmLabel="Mengesahkan"
        onConfirm={handleSignSopConfirm}
      />
    </>
  )
}
