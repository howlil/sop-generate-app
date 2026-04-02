/**
 * Koordinator Tim Penyusun: Berita Acara (verifikasi).
 * 1. Daftar BA yang sudah diverifikasi Biro, menunggu langkah verifikasi Koordinator.
 * 2. Detail: header, daftar SOP, preview BA, catatan evaluasi.
 * Verifikasi BA hanya Biro + Koordinator; pengesahan SOP hanya Kepala OPD.
 */
import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, PenLine, Eye, List, Printer, Calendar, MessageSquare } from 'lucide-react'
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
import { evaluasiApi } from '@/services/evaluasi.api'
import { apiClient } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import type { PengajuanEvaluasi } from '@/types/evaluasi'
import { useToast } from '@/hooks/useUI'
import { getRiwayatEvaluasiSop } from '@/hooks/useEvaluasi'
import { formatDateId, formatDateIdLong } from '@/utils/format-date'
import { ROUTES } from '@/utils/constants/ui'
import { Route } from '@/routes/tim-penyusun.berita-acara'
import { useAppRole } from '@/hooks/useAppRole'
import { canTimPenyusunRunCoordinatorActions } from '@/hooks/useSop'
import { ROLES } from '@/utils/constants/ui'
import { InfoCard } from '@/components/ui/info-card'
import { IA } from '@/utils/constants/pipeline-ia'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function BeritaAcaraKoordinatorPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id: searchId } = Route.useSearch()
  const { role } = useAppRole()
  const { showToast } = useToast()
  const [signingTerjadwalId, setSigningTerjadwalId] = useState<string | null>(null)
  const selectedBaId = searchId ?? null
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null)
  const [previewMainTab, setPreviewMainTab] = useState<'sop' | 'ba'>('ba')

  const { data: pengajuanList = [] } = useQuery({
    queryKey: queryKeys.evaluasiList(),
    queryFn: () => evaluasiApi.findAll(),
    staleTime: 3 * 60 * 1000, // 3 minutes
  })

  const updatePengajuanMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: string; ditandatanganiOlehKoordinatorUserId: string } }) => {
      // Note: This needs a proper API endpoint - using direct patch for now
      return apiClient.patch<PengajuanEvaluasi>(`/evaluasi/${id}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasiList() })
    },
  })

  const updatePengajuan = (id: string, payload: { status: string; ditandatanganiOlehKoordinatorUserId: string }) => {
    updatePengajuanMutation.mutate({ id, payload })
  }

  const goToDetail = (baId: string) => navigate({ to: ROUTES.TIM_PENYUSUN.BERITA_ACARA, search: { id: baId } })

  /** BA yang sudah diverifikasi Biro, menunggu verifikasi Koordinator (bukan pengesahan Kepala OPD). */
  const baMenungguTTD = useMemo(
    () => pengajuanList.filter((p) => p.status === 'DIVERIFIKASI_BIRO'),
    [pengajuanList]
  )

  const selectedBa = useMemo(
    () =>
      selectedBaId
        ? pengajuanList.find((p) => p.id === selectedBaId) ?? null
        : null,
    [pengajuanList, selectedBaId]
  )

  const sopList = selectedBa?.sopList ?? []
  const firstSopId = sopList[0]?.id ?? null
  const effectiveSopId = selectedSopId ?? firstSopId
  const displaySop = sopList.find((s) => s.id === effectiveSopId) ?? null

  useEffect(() => {
    setSelectedSopId(null)
  }, [selectedBaId])

  useEffect(() => {
    if (selectedBaId && selectedBa === null && pengajuanList.length > 0) {
      navigate({ to: ROUTES.TIM_PENYUSUN.BERITA_ACARA, search: (prev) => ({ ...prev, id: undefined }) })
    }
  }, [selectedBaId, selectedBa, pengajuanList.length, navigate])

  const signingTerjadwal = useMemo(
    () => (signingTerjadwalId ? pengajuanList.find((p) => p.id === signingTerjadwalId) : null),
    [pengajuanList, signingTerjadwalId]
  )

  const tte = useTTESignature({
    role: 'tim-penyusun',
    documentId: signingTerjadwal ? `berita-acara-${signingTerjadwal.id}` : undefined,
  })

  const docTitle = useMemo(() => {
    if (!canTimPenyusunRunCoordinatorActions(role)) return IA.NAV_TP_BA_KOORDINATOR
    if (selectedBaId && selectedBa) return `Detail ${IA.BERITA_ACARA} — ${selectedBa.nomorBA ?? ''}`
    return IA.NAV_TP_BA_KOORDINATOR
  }, [role, selectedBaId, selectedBa])

  useDocumentTitle(docTitle)

  const handlePinConfirm = tte.createPinConfirmHandler(
    {
      documentLabel: `Berita Acara ${signingTerjadwal?.nomorBA ?? ''}`,
      referenceId: signingTerjadwal?.nomorBA ?? signingTerjadwal?.id ?? '',
    },
    () => {
      if (!signingTerjadwalId) return
      const today = new Date().toISOString().split('T')[0]
      updatePengajuan(signingTerjadwalId, {
        status: 'DITANDATANGANI_KOORDINATOR',
        ditandatanganiOlehKoordinatorUserId: 'current-user-id',
      })
      pushPipelineNotification({
        title: 'Berita Acara siap pengesahan',
        body: signingTerjadwal
          ? `BA ${signingTerjadwal.nomorBA ?? signingTerjadwal.id} — ${signingTerjadwal.opd}: Kepala OPD dapat mengesahkan SOP di menu Berita Acara & pengesahan.`
          : 'Kepala OPD dapat melanjutkan pengesahan SOP.',
        targetRole: ROLES.KEPALA_OPD,
        actionTo: ROUTES.KEPALA_OPD.BERITA_ACARA,
      })
      showToast('Verifikasi Berita Acara (Koordinator) selesai. Kepala OPD dapat melakukan pengesahan per SOP.')
      setSigningTerjadwalId(null)
    }
  )

  const openSignDialog = (id: string) => setSigningTerjadwalId(id)
  const closeSignDialog = () => setSigningTerjadwalId(null)

  if (!canTimPenyusunRunCoordinatorActions(role)) {
    return (
      <ListPageLayout
        breadcrumb={[{ label: IA.NAV_TP_BA_KOORDINATOR }]}
        title={IA.NAV_TP_BA_KOORDINATOR}
        description={`${IA.VERIFIKASI_BA_KOORDINATOR} pada dokumen ${IA.BERITA_ACARA} setelah ${IA.VERIFIKASI_BA_BIRO}.`}
      >
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <EmptyState
            icon={<FileText />}
            title="Akses terbatas"
            description="Halaman ini hanya untuk Koordinator Tim Penyusun. Anggota tim menggunakan Manajemen SOP untuk menyusun dokumen."
          />
        </div>
      </ListPageLayout>
    )
  }

  // ——— Tampilan: tidak ada BA ———
  if (!selectedBaId && baMenungguTTD.length === 0) {
    return (
      <ListPageLayout
        breadcrumb={[{ label: IA.NAV_TP_BA_KOORDINATOR }]}
        title={IA.NAV_TP_BA_KOORDINATOR}
        description={`Belum ada dokumen ${IA.BERITA_ACARA} yang menunggu ${IA.VERIFIKASI_BA_KOORDINATOR}.`}
      >
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <EmptyState
            icon={<FileText />}
            title="Tidak ada Berita Acara menunggu verifikasi Koordinator"
            description="Semua BA sudah diverifikasi Koordinator, atau belum ada BA yang diverifikasi Biro."
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
          breadcrumb={[{ label: IA.NAV_TP_BA_KOORDINATOR }]}
          title={IA.NAV_TP_BA_KOORDINATOR}
          description={`Daftar dokumen ${IA.BERITA_ACARA} setelah ${IA.VERIFIKASI_BA_BIRO}. ${IA.PENGESAHAN_SOP} oleh Kepala OPD di menu terpisah.`}
        >
          {baMenungguTTD.length > 0 && !tte.canSign && (
            <InfoCard variant="info" className="mb-3">
              <p className="text-blue-900">
                <strong>TTE belum siap.</strong> Untuk {IA.VERIFIKASI_BA_KOORDINATOR} Anda perlu profil TTE aktif.{' '}
                <Link to={ROUTES.TIM_PENYUSUN.TTD} className="font-medium underline">
                  Buka TTD Elektronik
                </Link>
                .
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
                        <div className="flex items-center gap-1">
                          <IconActionButton
                            icon={Eye}
                            title="Lihat detail"
                            onClick={() => goToDetail(p.id)}
                          />
                          <IconActionButton
                            icon={PenLine}
                            title={!tte.canSign ? 'Setup TTE terlebih dahulu' : 'Verifikasi Berita Acara (Koordinator)'}
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
          open={signingTerjadwalId !== null}
          onOpenChange={(open) => !open && closeSignDialog()}
          title="Verifikasi Berita Acara (Koordinator)"
          description="Masukkan PIN TTE untuk verifikasi BA (bukan pengesahan). Pengesahan SOP dilakukan Kepala OPD."
          confirmLabel="Verifikasi"
          onConfirm={handlePinConfirm}
        />
      </>
    )
  }

  // ——— Guard: selectedBaId valid tapi BA tidak ditemukan ———
  if (selectedBaId && selectedBa === null) return null

  // ——— Tampilan: detail BA ———
  const riwayatEvaluasiSop = getRiwayatEvaluasiSop()
  const riwayatSop = effectiveSopId ? (riwayatEvaluasiSop[effectiveSopId] ?? []) : []

  return (
    <>
      <DetailPageLayout
        breadcrumb={[
          { label: IA.NAV_TP_BA_KOORDINATOR, to: ROUTES.TIM_PENYUSUN.BERITA_ACARA },
          { label: selectedBa?.nomorBA ?? 'Detail' },
        ]}
        title={`Detail ${IA.BERITA_ACARA} — ${selectedBa?.nomorBA ?? ''}`}
        description={
          selectedBa?.isSignedByKoordinator
            ? `${IA.VERIFIKASI_BA_KOORDINATOR} selesai. ${IA.PENGESAHAN_SOP} oleh Kepala OPD.`
            : `Lanjutkan ${IA.VERIFIKASI_BA_KOORDINATOR} pada dokumen ${IA.BERITA_ACARA}; ${IA.PENGESAHAN_SOP} hanya oleh Kepala OPD.`
        }
        backTo={ROUTES.TIM_PENYUSUN.BERITA_ACARA}
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
                {!selectedBa?.isSignedByKoordinator && (
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-blue-500 text-white hover:bg-blue-600"
                    disabled={!tte.canSign}
                    title={!tte.canSign ? 'Setup TTE terlebih dahulu' : 'Verifikasi Berita Acara (Koordinator)'}
                    onClick={() => selectedBa && openSignDialog(selectedBa.id)}
                  >
                    <PenLine className="w-3.5 h-3.5" /> Verifikasi BA
                  </Button>
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
                  <div className="flex-1 min-h-0 overflow-auto scrollbar-hide">
                    <SOPPreviewTemplate name={displaySop.nama} number={displaySop.nomor} />
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
        open={signingTerjadwalId !== null}
        onOpenChange={(open) => !open && closeSignDialog()}
        title="Verifikasi Berita Acara (Koordinator)"
        description="Masukkan PIN TTE untuk verifikasi BA (bukan pengesahan). Pengesahan SOP dilakukan Kepala OPD."
        confirmLabel="Verifikasi"
        onConfirm={handlePinConfirm}
      />
    </>
  )
}
