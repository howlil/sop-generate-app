import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Save, Check, History, PenLine, MessageSquare, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { useToast } from '@/hooks/useUI'
import { usePeraturan } from '@/hooks/usePeraturan'
import { usePelaksana } from '@/hooks/usePelaksana'
import { useSopStatus } from '@/hooks/useSopStatus'
import {
  getInitialSopDetailMetadata,
  getInitialSopDetailProsedurRows,
  getInitialSopDetailKomentar,
  getInitialSopDetailVersions,
} from '@/lib/data/sop-detail'
import type { SOPDetailMetadata, ProsedurRow } from '@/lib/types/sop'
import type { VersionHistoryItem } from '@/components/sop/VersionHistoryPanel'
import { useKomentar } from '@/hooks/useKomentar'
import { KomentarPanel } from '@/components/sop/KomentarPanel'
import { VersionHistoryPanel } from '@/components/sop/VersionHistoryPanel'
import { DetailSOPMetadataPanel } from './detail-sop/DetailSOPMetadataPanel'
import { DetailSOPProsedurEditor } from './detail-sop/DetailSOPProsedurEditor'
import { formatDateIdLong } from '@/utils/format-date'
import * as versionDiff from '@/utils/version-diff'
import { ROUTES } from '@/lib/constants/routes'

export function DetailSOPPenyusun() {
  const { showToast } = useToast()
  const { setSopStatusOverride } = useSopStatus()
  const { list: peraturanList } = usePeraturan()
  const { list: pelaksanaList } = usePelaksana()
  const { id } = useParams({ from: '/tim-penyusun/detail-sop/$id' })
  const navigate = useNavigate()

  const [metadata, setMetadata] = useState<SOPDetailMetadata>(() => getInitialSopDetailMetadata())
  const [prosedurRows, setProsedurRows] = useState<ProsedurRow[]>(() => getInitialSopDetailProsedurRows())
  const [implementers, setImplementers] = useState<{ id: string; name: string }[]>([])
  const implementersSeededRef = useRef(false)
  const masterPelaksanaOptions = useMemo(
    () => pelaksanaList.map((p) => ({ id: p.id, name: p.nama })),
    [pelaksanaList]
  )
  useEffect(() => {
    if (implementersSeededRef.current || pelaksanaList.length === 0) return
    const ids = new Set(prosedurRows.flatMap((r) => Object.keys(r.pelaksana)))
    if (ids.size === 0) return
    implementersSeededRef.current = true
    setImplementers(
      Array.from(ids).map((id) => {
        const p = pelaksanaList.find((x) => x.id === id)
        return { id, name: p?.nama ?? id }
      })
    )
  }, [pelaksanaList, prosedurRows])
  const [diagramVersion, setDiagramVersion] = useState(0)

  const [activeTab, setActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')
  const [isEditingSteps, setIsEditingSteps] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isEditPanelCollapsed, setIsEditPanelCollapsed] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<'edit' | 'komentar' | 'riwayat'>('edit')

  const { displayList: komentarDisplay, handleResolveComment } = useKomentar({
    initialData: getInitialSopDetailKomentar(),
    includeRoles: ['Tim Evaluasi'],
  })

  const [versions, _setVersions] = useState<VersionHistoryItem[]>(
    () => getInitialSopDetailVersions() as VersionHistoryItem[]
  )

  const [viewingVersion, setViewingVersion] = useState<VersionHistoryItem | null>(null)

  const versionDiffItems = useMemo(
    () => versionDiff.computeVersionDiff(metadata, prosedurRows, viewingVersion?.snapshot ?? undefined),
    [viewingVersion, metadata, prosedurRows]
  )

  const handleMetadataChange = <K extends keyof SOPDetailMetadata>(
    field: K,
    value: SOPDetailMetadata[K]
  ) => {
    setMetadata((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <DetailPageLayout
        breadcrumb={[
          { label: 'Manajemen SOP', to: ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP },
          { label: 'Edit SOP' },
        ]}
        title="Edit Dokumen SOP"
        description={metadata.name}
        backTo={ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP}
        backSize="icon"
        workspaceClassName="print:hidden"
        header={
          <>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">Dokumen SOP</h2>
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
                  variant="outline"
                  className="h-8 px-3 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50"
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
                  className="h-8 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs gap-1.5"
                  onClick={() => {
                    if (id) {
                      setSopStatusOverride(id, 'Siap Dievaluasi')
                      showToast('SOP selesai disusun. Status: Siap Dievaluasi. Anda dapat mengajukan evaluasi dari Manajemen SOP.')
                      navigate({ to: ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP })
                    }
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  Selesai
                </Button>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
              <Badge className="h-4 px-1.5 text-xs bg-blue-100 text-blue-700 border-0">v{versions[0]?.version || metadata.version || '1.0'}</Badge>
              {metadata.dibuatOleh && (
                <span><span className="text-gray-500">Dibuat oleh:</span> {metadata.dibuatOleh}</span>
              )}
              {metadata.dieditOleh && (
                <span><span className="text-gray-500">Diedit oleh:</span> {metadata.dieditOleh}</span>
              )}
            </div>
          </>
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
            {rightPanelTab === 'komentar' && (
              <KomentarPanel
                comments={komentarDisplay}
                onResolve={handleResolveComment}
                avatarVariant="blue"
              />
            )}
            {rightPanelTab === 'edit' && (
              <DetailSOPMetadataPanel
                metadata={metadata}
                onMetadataChange={handleMetadataChange}
                implementers={implementers}
                onImplementersChange={setImplementers}
                implementersFromMaster
                masterPelaksanaOptions={masterPelaksanaOptions}
                peraturanList={peraturanList}
              />
            )}
            {rightPanelTab === 'riwayat' && (
              <VersionHistoryPanel
                variant="cards"
                versions={versions}
                summary={`${versions.length} versi terdokumentasi`}
                viewingVersion={viewingVersion}
                setViewingVersion={setViewingVersion}
                versionDiff={versionDiffItems}
              />
            )}
          </CollapsibleSidePanel>
        }
      />

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="text-sm">Riwayat Versi</DialogTitle>
            <DialogDescription className="text-xs">{versions.length} versi terdokumentasi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {versions.map((version, _index) => (
              <div
                key={version.id}
                className="bg-gray-50 rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-900">Versi {version.version}</p>
                  <p className="text-xs text-gray-500">{formatDateIdLong(version.date)}</p>
                </div>
                <p className="text-xs text-gray-700 mb-2">{version.changes}</p>
                <p className="text-xs text-gray-600">Author: {version.author}</p>
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
    </>
  )
}
