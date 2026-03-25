/**
 * Kepala OPD: Berita Acara — pengesahan SOP setelah verifikasi BA (Biro + Koordinator) selesai.
 */
import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { FileText, Eye, List, Printer, Calendar, MessageSquare, FileCheck } from 'lucide-react'
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
import { IA } from '@/lib/constants/pipeline-ia'
import { Route } from '@/routes/kepala-opd.berita-acara'
import { InfoCard } from '@/components/ui/info-card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { verifyPin } from '@/lib/domain/tte'
import { getTTEProfile, addTTESignature } from '@/lib/data/tte-storage'

export function BeritaAcaraPage() {
  const navigate = useNavigate()
  const { id: searchId } = Route.useSearch()
  const opdId = getKepalaOPDOpdId()
  const opds = useOpdList()
  const opdName = opds.find((o) => o.id === opdId)?.name ?? ''
  const { list: batchList } = useVerifikasiBatchList()
  const { showToast } = useToast()
  const { getSopStatusOverride, setSopStatusOverride } = useSopStatus()
  const [signingSopId, setSigningSopId] = useState<string | null>(null)
  const [signingBulkIds, setSigningBulkIds] = useState<string[] | null>(null)
  const selectedBaId = searchId ?? null
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null)
  const [previewMainTab, setPreviewMainTab] = useState<'sop' | 'ba'>('ba')

  const goToDetail = (baId: string) => navigate({ to: ROUTES.KEPALA_OPD.BERITA_ACARA, search: { id: baId } })

  const baMenungguTTD = useMemo(
    () => batchList.filter((p) => p.isVerified === true && p.isSignedByKoordinator === true),
    [batchList]
  )

  /** BA yang dipilih — hanya dari daftar BA yang boleh diakses (baMenungguTTD). */
  const selectedBa = useMemo(
    () =>
      selectedBaId
        ? baMenungguTTD.find((p) => p.id === selectedBaId) ?? null
        : null,
    [baMenungguTTD, selectedBaId]
  )

  /**
   * Redirect ke list jika URL berisi id BA yang tidak ada dalam baMenungguTTD.
   * Hanya redirect setelah batchList selesai dimuat (batchList.length > 0 atau setelah init).
   */
  useEffect(() => {
    if (selectedBaId && selectedBa === null && batchList.length > 0) {
      navigate({ to: ROUTES.KEPALA_OPD.BERITA_ACARA, search: { id: undefined } })
    }
  }, [selectedBaId, selectedBa, batchList.length, navigate])

  const sopList = selectedBa?.sopList ?? []
  const firstSopId = sopList[0]?.id ?? null
  const effectiveSopId = selectedSopId ?? firstSopId
  const displaySop = sopList.find((s) => s.id === effectiveSopId) ?? null

  useEffect(() => {
    setSelectedSopId(null)
  }, [selectedBaId])

  const openSignSopDialog = (sopId: string) => {
    setSigningBulkIds(null)
    setSigningSopId(sopId)
  }
  const closeSignSopDialog = () => {
    setSigningSopId(null)
    setSigningBulkIds(null)
  }

  const tteSop = useTTESignature({
    role: 'kepala-opd',
    documentId: signingSopId ?? undefined,
  })
  const signingSop =
    signingSopId && displaySop?.id === signingSopId ? displaySop : null
  const handleSignSopConfirmSingle = tteSop.createPinConfirmHandler(
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

  const signableSopIds = useMemo(() => {
    return sopList
      .filter((s) => {
        const st = (getSopStatusOverride(s.id) ?? s.status) as StatusSOP
        return canKepalaOpdSignSop(st, batchList, opdName, s.id, s.nomor)
      })
      .map((s) => s.id)
  }, [sopList, batchList, opdName, getSopStatusOverride])

  const firstSignableSop = useMemo(
    () =>
      tteSop.canSign
        ? sopList.find((s) => {
            const st = (getSopStatusOverride(s.id) ?? s.status) as StatusSOP
            return canKepalaOpdSignSop(st, batchList, opdName, s.id, s.nomor)
          })
        : null,
    [tteSop.canSign, sopList, batchList, opdName, getSopStatusOverride]
  )

  const docTitle = useMemo(() => {
    if (selectedBaId && selectedBa) return `Detail ${IA.BERITA_ACARA} — ${selectedBa.nomorBA ?? ''}`
    return IA.NAV_KO_BA_PENGESAHAN
  }, [selectedBaId, selectedBa])

  useDocumentTitle(docTitle)

  const handlePinConfirm = (pin: string): boolean => {
    if (signingBulkIds && signingBulkIds.length > 0) {
      const profile = getTTEProfile('kepala-opd')
      if (!profile || !verifyPin(pin, profile.pinHash)) return false
      for (const id of signingBulkIds) {
        const sop = sopList.find((x) => x.id === id)
        addTTESignature(
          'kepala-opd',
          profile.nip,
          profile.namaLengkap,
          profile.jabatan,
          profile.pangkat,
          id,
          sop?.nama ?? 'SOP',
          sop?.nomor ?? id
        )
        setSopStatusOverride(id, 'Berlaku')
      }
      showToast(`${signingBulkIds.length} SOP berhasil disahkan dengan satu PIN TTE.`)
      setSigningBulkIds(null)
      return true
    }
    return handleSignSopConfirmSingle(pin)
  }

  // ——— Guard: id BA di URL tidak ada dalam daftar BA yang boleh diakses — tunggu redirect ———
  if (selectedBaId && selectedBa === null) {
    return null
  }

  // ——— Tampilan: tidak ada BA ———
  // Hanya tampilkan empty-state jika TIDAK ada BA sama sekali dan user tidak sedang membuka detail tertentu.
  if (!selectedBaId && baMenungguTTD.length === 0) {
    return (
      <ListPageLayout
        breadcrumb={[{ label: IA.NAV_KO_BA_PENGESAHAN }]}
        title={IA.NAV_KO_BA_PENGESAHAN}
        description={`Dokumen ${IA.BERITA_ACARA} OPD Anda setelah ${IA.VERIFIKASI_BA_BIRO} dan ${IA.VERIFIKASI_BA_KOORDINATOR}. ${IA.PENGESAHAN_SOP} oleh Anda.`}
      >
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <EmptyState
            icon={<FileText />}
            title="Tidak ada BA menunggu pengesahan"
            description="Semua SOP sudah disahkan, atau verifikasi BA (Biro/Koordinator) belum selesai."
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
          breadcrumb={[{ label: IA.NAV_KO_BA_PENGESAHAN }]}
          title={IA.NAV_KO_BA_PENGESAHAN}
          description={`Daftar dokumen ${IA.BERITA_ACARA} dengan verifikasi lengkap. ${IA.PENGESAHAN_SOP} memakai TTE setelah profil siap.`}
        >
          {baMenungguTTD.length > 0 && !tteSop.canSign && (
            <InfoCard variant="info" className="mb-3">
              <p className="text-blue-900">
                <strong>TTE belum siap.</strong> Untuk {IA.PENGESAHAN_SOP} Anda perlu profil TTE aktif (email terverifikasi dan PIN).{' '}
                <Link to={ROUTES.KEPALA_OPD.TTD} className="font-medium underline">
                  Buka TTD Elektronik
                </Link>
              </p>
            </InfoCard>
          )}
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
                        <IconActionButton
                          icon={Eye}
                          title="Lihat detail"
                          onClick={() => goToDetail(p.id)}
                        />
                      </Table.Td>
                    </Table.BodyRow>
                  ))}
                </tbody>
              </Table.Table>
            </Table.Root>
          </div>
        </ListPageLayout>

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
    !!displaySop &&
    !!sopStatusForDisplay &&
    canKepalaOpdSignSop(sopStatusForDisplay, batchList, opdName, displaySop.id, displaySop.nomor) &&
    tteSop.canSign
  const hasAnySignableSop = !!firstSignableSop

  return (
    <>
      <DetailPageLayout
        breadcrumb={[
          { label: IA.NAV_KO_BA_PENGESAHAN, to: ROUTES.KEPALA_OPD.BERITA_ACARA },
          { label: selectedBa?.nomorBA ?? 'Detail' },
        ]}
        title={`Detail ${IA.BERITA_ACARA} — ${selectedBa?.nomorBA ?? ''}`}
        description={`${IA.PENGESAHAN_SOP}: pilih SOP di kiri, lalu tanda tangani dengan TTE — setelah ${IA.VERIFIKASI_BA_KOORDINATOR} selesai.`}
        backTo={ROUTES.KEPALA_OPD.BERITA_ACARA}
        backSize="icon"
        header={
          <>
            {!tteSop.canSign && sopList.length > 0 && (
              <InfoCard variant="info" className="mb-3">
                <p className="text-blue-900">
                  <strong>TTE belum siap.</strong> {IA.PENGESAHAN_SOP} membutuhkan profil TTE.{' '}
                  <Link to={ROUTES.KEPALA_OPD.TTD} className="font-medium underline">
                    Atur TTD Elektronik
                  </Link>
                </p>
              </InfoCard>
            )}
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
                {hasAnySignableSop && firstSignableSop && (
                  <>
                    {signableSopIds.length > 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs gap-1.5 border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                        title="Sahkan semua SOP yang memenuhi syarat dengan satu PIN"
                        onClick={() => {
                          setSigningSopId(null)
                          setSigningBulkIds(signableSopIds)
                          setPreviewMainTab('sop')
                        }}
                      >
                        <FileCheck className="w-3.5 h-3.5" /> Sahkan semua ({signableSopIds.length})
                      </Button>
                    )}
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
                  </>
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
            widthExpanded="w-full"
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
            widthExpanded="w-full"
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
        open={signingSopId !== null || (signingBulkIds?.length ?? 0) > 0}
        onOpenChange={(open) => !open && closeSignSopDialog()}
        title={signingBulkIds?.length ? `Mengesahkan ${signingBulkIds.length} SOP` : 'Mengesahkan SOP'}
        description={
          signingBulkIds?.length
            ? `Masukkan PIN TTE sekali untuk mengesahkan ${signingBulkIds.length} SOP sekaligus (status menjadi Berlaku).`
            : 'Masukkan PIN TTE BSRE untuk mengesahkan SOP ini (status menjadi Berlaku).'
        }
        confirmLabel="Mengesahkan"
        onConfirm={handlePinConfirm}
      />
    </>
  )
}
