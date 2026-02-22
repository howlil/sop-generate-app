import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Save, Check, History, PenLine, MessageSquare, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { showToast } from '@/lib/stores'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { PageHeader } from '@/components/layout/PageHeader'
import { DetailWorkspace } from '@/components/layout/DetailWorkspace'
import { getPeraturanList, subscribe as subscribePeraturan } from '@/lib/stores/peraturan-store'
import type { Peraturan } from '@/lib/types/peraturan'
import { setSopStatusOverride } from '@/lib/stores/sop-status-store'
import {
  SEED_KOMENTAR_LIST,
  getInitialVersions,
  type KomentarSeed,
  type VersionSeed,
} from '@/lib/seed/sop-detail-seed'
import { useDetailSOPMetadata } from '@/hooks/useDetailSOPMetadata'
import { useDetailSOPProsedur } from '@/hooks/useDetailSOPProsedur'
import { KomentarPanel, type KomentarItem } from '@/components/sop/KomentarPanel'
import { VersionHistoryPanel } from '@/components/sop/VersionHistoryPanel'
import { DetailSOPMetadataPanel } from './detail-sop/DetailSOPMetadataPanel'
import { DetailSOPProsedurEditor } from './detail-sop/DetailSOPProsedurEditor'

type Komentar = KomentarSeed
type Version = VersionSeed

export function DetailSOPPenyusun() {
  const { id } = useParams({ from: '/tim-penyusun/detail-sop/$id' })
  const navigate = useNavigate()

  const { metadata, setMetadata, handleMetadataChange } = useDetailSOPMetadata()
  const {
    prosedurRows,
    setProsedurRows,
    implementers,
    setImplementers,
    diagramVersion,
    setDiagramVersion,
  } = useDetailSOPProsedur()

  const [activeTab, setActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  /** Versi yang sedang dilihat (klik card); null = tidak melihat versi lama */
  const [viewingVersion, setViewingVersion] = useState<Version | null>(null)
  const [isEditingSteps, setIsEditingSteps] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isEditPanelCollapsed, setIsEditPanelCollapsed] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<'edit' | 'komentar' | 'riwayat'>('edit')

  /** Data peraturan (mock: diasumsikan peraturan OPD tersedia di store). */
  const [peraturanList, setPeraturanList] = useState<Peraturan[]>(() => getPeraturanList())
  useEffect(() => {
    setPeraturanList(getPeraturanList())
    return subscribePeraturan(() => setPeraturanList(getPeraturanList()))
  }, [])

  /** Komentar hanya dari Kepala OPD dan Tim Evaluasi (Tim Penyusun tidak bisa membuat komentar). */
  const [komentarList, setKomentarList] = useState<Komentar[]>(() => [...SEED_KOMENTAR_LIST])

  const [versions, _setVersions] = useState<Version[]>(() => getInitialVersions())

  /** Perbedaan versi saat ini vs versi yang dilihat (untuk card diff di panel riwayat) */
  const versionDiff = useMemo(() => {
    if (!viewingVersion?.snapshot) return []
    const cur = { metadata, prosedurRows }
    const view = viewingVersion.snapshot
    const out: { label: string; current: string; viewed: string }[] = []
    if (String(cur.metadata.name ?? '') !== String(view.metadata?.name ?? '')) {
      out.push({ label: 'Nama SOP', current: String(cur.metadata.name ?? ''), viewed: String(view.metadata?.name ?? '') })
    }
    if (String(cur.metadata.number ?? '') !== String(view.metadata?.number ?? '')) {
      out.push({ label: 'Nomor SOP', current: String(cur.metadata.number ?? ''), viewed: String(view.metadata?.number ?? '') })
    }
    if (Number(cur.metadata.version) !== Number(view.metadata?.version)) {
      out.push({ label: 'Versi', current: String(cur.metadata.version ?? ''), viewed: String(view.metadata?.version ?? '') })
    }
    if (cur.prosedurRows.length !== (view.prosedurRows?.length ?? 0)) {
      out.push({
        label: 'Jumlah langkah',
        current: String(cur.prosedurRows.length),
        viewed: String(view.prosedurRows?.length ?? 0),
      })
    }
    const maxRows = Math.max(cur.prosedurRows.length, view.prosedurRows?.length ?? 0)
    for (let i = 0; i < maxRows; i++) {
      const rCur = cur.prosedurRows[i]
      const rView = view.prosedurRows?.[i]
      const prefix = `Langkah ${i + 1}`
      if (!rView) {
        out.push({ label: prefix, current: rCur?.kegiatan ?? '-', viewed: '(dihapus)' })
        continue
      }
      if (!rCur) {
        out.push({ label: prefix, current: '(ditambahkan)', viewed: rView.kegiatan ?? '-' })
        continue
      }
      if (String(rCur.kegiatan ?? '') !== String(rView.kegiatan ?? '')) {
        out.push({ label: `${prefix} — Kegiatan`, current: String(rCur.kegiatan ?? ''), viewed: String(rView.kegiatan ?? '') })
      }
      if (String(rCur.mutu_waktu ?? '') !== String(rView.mutu_waktu ?? '')) {
        out.push({ label: `${prefix} — Waktu`, current: String(rCur.mutu_waktu ?? ''), viewed: String(rView.mutu_waktu ?? '') })
      }
    }
    return out
  }, [viewingVersion, metadata, prosedurRows])

  const handleResolveComment = (cid: string) => {
    setKomentarList((prev) =>
      prev.map((k) => (k.id === cid ? { ...k, status: 'resolved' as const } : k))
    )
    showToast('Komentar ditandai sebagai resolved')
  }

  const handleRollback = () => {
    if (!selectedVersion?.snapshot) {
      showToast('Versi tidak memiliki snapshot yang tersimpan', 'error')
      return
    }
    setMetadata({ ...selectedVersion.snapshot.metadata })
    setProsedurRows(selectedVersion.snapshot.prosedurRows ? [...selectedVersion.snapshot.prosedurRows] : [])
    setIsRollbackDialogOpen(false)
    showToast(`Berhasil rollback ke versi ${selectedVersion.version}`)
  }



  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] min-h-0 gap-3">
      <PageHeader
        breadcrumb={[
          { label: 'SOP Saya', to: '/tim-penyusun/sop-saya' },
          { label: 'Edit SOP' },
        ]}
        title="Edit Dokumen SOP"
        description={metadata.name}
        leading={
          <BackButton size="icon" onClick={() => navigate({ to: '/tim-penyusun/sop-saya' })} />
        }
      />

      <DetailWorkspace
        className="print:hidden"
        header={
          <div className="flex items-center justify-end gap-2 p-3">
            <Badge className="bg-blue-100 text-blue-700 text-xs border-0">
              v{versions[0]?.version || '1.0'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                if (id) {
                  setSopStatusOverride(id, 'Sedang Disusun')
                  showToast('Status diubah menjadi Sedang Disusun')
                }
              }}
            >
              <Save className="w-3.5 h-3.5" />
              Simpan sebagai draft
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                if (id) {
                  setSopStatusOverride(id, 'Diperiksa Kepala OPD')
                  showToast('SOP diserahkan ke Kepala OPD')
                  navigate({ to: '/tim-penyusun/sop-saya' })
                }
              }}
            >
              <Check className="w-3.5 h-3.5" />
              Serahkan ke Kepala OPD
            </Button>
          </div>
        }
        main={
          <div className="flex flex-col h-full p-4">
            <SOPPreviewTemplate
              metadata={metadata}
              prosedurRows={prosedurRows}
              implementers={implementers}
              pathLayoutSeed={diagramVersion}
              activeTab={activeTab}
              onActiveTabChange={setActiveTab}
              toolbar={
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center rounded-lg border border-gray-200 bg-white p-2 sm:p-1.5 shadow-sm gap-2 sm:gap-0 w-full sm:w-auto">
                    <Tabs
                      value={activeTab}
                      onValueChange={(v) => setActiveTab(v as 'flowchart' | 'bpmn')}
                      className="w-full sm:w-auto"
                    >
                      <TabsList className="grid w-full sm:w-auto grid-cols-2 h-8 bg-gray-100/80 p-0.5 gap-0.5 rounded-md border-0">
                        <TabsTrigger value="flowchart" className="text-xs font-medium h-7 px-4">
                          Flowchart
                        </TabsTrigger>
                        <TabsTrigger value="bpmn" className="text-xs font-medium h-7 px-4">
                          BPMN
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <div className="hidden sm:block w-px bg-gray-200 mx-1 min-h-5 self-stretch" aria-hidden />
                    <div className="flex items-center justify-center sm:justify-end gap-1.5 sm:pr-1 sm:pl-0.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-3 rounded-md border-gray-200"
                        onClick={() => setIsEditingSteps((prev) => !prev)}
                      >
                        Ubah langkah
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-3 rounded-md border-gray-200 hover:bg-gray-50"
                        disabled={isEditingSteps}
                        onClick={() => setDiagramVersion((v) => v + 1)}
                        title="Paksa susun ulang layout diagram"
                      >
                        Perbaiki diagram
                      </Button>
                    </div>
                  </div>
                </div>
              }
              diagramAlternate={
                isEditingSteps ? (
                  <DetailSOPProsedurEditor
                    prosedurRows={prosedurRows}
                    setProsedurRows={setProsedurRows}
                    implementers={implementers}
                    onDone={() => setIsEditingSteps(false)}
                  />
                ) : undefined
              }
            />
          </div>
        }
        rightPanel={
          <CollapsibleSidePanel
            side="right"
            collapsed={isEditPanelCollapsed}
            onCollapsedChange={setIsEditPanelCollapsed}
            widthCollapsed="w-10"
            widthExpanded="w-[min(380px,30%)] min-w-[280px]"
            tabs={[
              { id: 'edit', label: 'Edit', icon: <PenLine className="w-3.5 h-3.5" /> },
              { id: 'komentar', label: 'Komentar', icon: <MessageSquare className="w-3.5 h-3.5" /> },
              { id: 'riwayat', label: 'Riwayat', icon: <History className="w-3.5 h-3.5" /> },
            ]}
            activeTab={rightPanelTab}
            onTabChange={(id) => setRightPanelTab(id as 'edit' | 'komentar' | 'riwayat')}
          >
            {rightPanelTab === 'komentar' && (() => {
              const fromKepalaDanTim = komentarList.filter((k) => k.role !== 'Tim Penyusun')
              const openCount = fromKepalaDanTim.filter((k) => k.status === 'open').length
              const resolvedCount = fromKepalaDanTim.filter((k) => k.status === 'resolved').length
              const comments: KomentarItem[] = fromKepalaDanTim.map((k) => ({
                id: k.id,
                user: k.user,
                role: k.role,
                status: k.status,
                bagian: k.bagian,
                isi: k.isi,
                timestamp: k.timestamp,
              }))
              return (
                <KomentarPanel
                  comments={comments}
                  onResolve={handleResolveComment}
                  summary={`Dari Kepala OPD & Tim Evaluasi · ${openCount} terbuka · ${resolvedCount} resolved`}
                  avatarVariant="blue"
                />
              )
            })()}
            {rightPanelTab === 'edit' && (
              <DetailSOPMetadataPanel
                metadata={metadata}
                onMetadataChange={handleMetadataChange}
                implementers={implementers}
                onImplementersChange={setImplementers}
                peraturanList={peraturanList}
              />
            )}
            {rightPanelTab === 'riwayat' && (
              <VersionHistoryPanel
                variant="cards"
                versions={versions}
                viewingVersion={viewingVersion}
                setViewingVersion={(v) => setViewingVersion(v as Version | null)}
                versionDiff={versionDiff}
                onRollbackRequest={(version) => {
                  setSelectedVersion(version as Version)
                  setIsRollbackDialogOpen(true)
                }}
                summary={`${versions.length} versi terdokumentasi`}
              />
            )}
          </CollapsibleSidePanel>
        }
      />

      {/* Dialog Rollback + Riwayat Versi */}
      <Dialog open={isRollbackDialogOpen} onOpenChange={setIsRollbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Rollback ke Versi Sebelumnya</DialogTitle>
            <DialogDescription className="text-xs">
              Dokumen akan dikembalikan ke versi ini dan perubahan saat ini akan hilang
            </DialogDescription>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-xs font-semibold text-gray-900 mb-1">v{selectedVersion.version} — {selectedVersion.revisionType === 'major' ? 'Revisi major' : 'Revisi minor'}</p>
                <p className="text-xs text-gray-700 mb-2">{selectedVersion.changes}</p>
                <p className="text-xs text-gray-600">
                  Tanggal:{' '}
                  {new Date(selectedVersion.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs text-gray-600">Author: {selectedVersion.author}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-xs text-blue-900">
                  Setiap rollback mengubah dokumen sehingga <strong>memerlukan persetujuan Kepala OPD</strong> sebelum berlaku.
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-xs text-amber-900">
                  <strong>Peringatan:</strong> Rollback akan mengganti seluruh konten dokumen dengan
                  v{selectedVersion.version}. Perubahan yang belum disimpan akan hilang.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsRollbackDialogOpen(false)}>
              Batal
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700" onClick={handleRollback}>
              <RotateCcw className="w-3.5 h-3.5" />
              Rollback Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Riwayat Versi</DialogTitle>
            <DialogDescription className="text-xs">{versions.length} versi terdokumentasi. Klik card untuk melihat versi dan perbedaan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div
                key={version.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setViewingVersion(version)
                  setRightPanelTab('riwayat')
                  setIsHistoryOpen(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setViewingVersion(version)
                    setRightPanelTab('riwayat')
                    setIsHistoryOpen(false)
                  }
                }}
                className="bg-gray-50 rounded-md border border-gray-200 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-gray-900">v{version.version}</p>
                    {index === 0 && (
                      <Badge className="bg-blue-600 text-white text-xs border-0">Current</Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className={`text-xs border-0 ${
                        version.revisionType === 'major'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {version.revisionType === 'major' ? 'Revisi major' : 'Revisi minor'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(version.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <p className="text-xs text-gray-700 mb-2">{version.changes}</p>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className="text-xs text-gray-600">Author: {version.author}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-500">Klik untuk lihat versi & perbedaan</span>
                    {version.revisionType === 'minor' && version.snapshot && index !== 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedVersion(version)
                          setIsRollbackDialogOpen(true)
                          setIsHistoryOpen(false)
                        }}
                      >
                        <RotateCcw className="w-3 h-3" />
                        Rollback
                      </Button>
                    ) : version.revisionType === 'major' && index !== 0 ? (
                      <span className="text-[11px] text-amber-700">Rollback tidak tersedia</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsHistoryOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
