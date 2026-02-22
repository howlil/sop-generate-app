import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import {
  MessageSquare,
  History,
  Calendar,
  Building2,
  Users,
  RefreshCw,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { DetailWorkspace } from '@/components/layout/DetailWorkspace'
import { KomentarPanel } from '@/components/sop/KomentarPanel'
import { VersionHistoryPanel } from '@/components/sop/VersionHistoryPanel'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import type { ProsedurRow } from '@/lib/types/sop'
import { PageHeader } from '@/components/layout/PageHeader'
import { showToast } from '@/lib/stores'
import type { TTESignaturePayload } from '@/lib/types/tte'
import { getTTEProfile, getTTESignatures, verifyPin, addTTESignature } from '@/lib/tte'
import { PinVerificationDialog } from '@/components/tte/PinVerificationDialog'
import { getSopStatusOverride, setSopStatusOverride } from '@/lib/stores/sop-status-store'
import type { StatusSOP } from '@/lib/types/sop'
import {
  SEED_IMPLEMENTERS,
  SEED_DETAIL_SOP_VIEW_METADATA,
  SEED_SOP_DETAIL_PROSEDUR_ROWS,
  SEED_DETAIL_SOP_KOMENTAR_INITIAL,
  SEED_DETAIL_SOP_VERSIONS,
  SEED_DETAIL_SOP_CURRENT_USER,
} from '@/lib/seed/sop-detail-seed'

interface Komentar {
  id: string
  user: string
  role: string
  timestamp: string
  bagian: string
  isi: string
  status: 'open' | 'resolved'
}

interface Version {
  id: string
  version: string
  date: string
  author: string
  changes: string
  snapshot: { metadata?: Record<string, unknown>; prosedurRows?: ProsedurRow[] } | null
  eventLabel?: string
  revisionType?: 'major' | 'minor'
}

export function DetailSOP() {
  const params = useParams({ strict: false })
  const id = 'id' in params ? params.id : undefined
  const navigate = useNavigate()
  const location = useLocation()
  /** Data penugasan dari inisiasi proyek (diteruskan dari Daftar SOP); tanpa info spesifik SOP seperti judul/nomor. */
  const penugasanState = location.state as {
    sopStatus?: StatusSOP
    waktuPenugasan?: string
    unitTerkait?: string
    timPenyusun?: string
    terakhirDiperbarui?: string
    deskripsiProyek?: string
  } | undefined
  /** Status SOP: dari store override atau dari state navigasi (Daftar SOP); Aksi Sahkan hanya untuk status Terverifikasi dari Kepala Biro. */
  const sopStatus: StatusSOP =
    (id ? getSopStatusOverride(id) : undefined) ??
    penugasanState?.sopStatus ??
    'Draft'

  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<'komentar' | 'riwayat'>('komentar')
  const [viewingVersion, setViewingVersion] = useState<Version | null>(null)
  const [newComment, setNewComment] = useState('')
  const [activeTab, setActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')
  const [ttePayload, setTtePayload] = useState<TTESignaturePayload | null>(null)
  const [pinDialogOpen, setPinDialogOpen] = useState(false)

  useEffect(() => {
    if (id) {
      const sig = getTTESignatures().find(
        (s) => s.documentId === id && s.role === 'kepala-opd'
      )
      setTtePayload(sig ?? null)
    }
  }, [id])

  const implementers = SEED_IMPLEMENTERS
  const metadata = SEED_DETAIL_SOP_VIEW_METADATA
  const prosedurRows = SEED_SOP_DETAIL_PROSEDUR_ROWS

  /** Hanya Kepala OPD / Tim Evaluasi yang punya komentar; Tim Penyusun tidak buat komentar. Resolve hanya di halaman Tim Penyusun. */
  const [komentarList, setKomentarList] = useState<Komentar[]>(SEED_DETAIL_SOP_KOMENTAR_INITIAL)

  const versions: Version[] = SEED_DETAIL_SOP_VERSIONS as Version[]

  const versionDiff = useMemo(() => {
    if (!viewingVersion?.snapshot) return []
    const view = viewingVersion.snapshot
    const curMeta = metadata as unknown as Record<string, unknown>
    const out: { label: string; current: string; viewed: string }[] = []
    if (String(curMeta.name ?? '') !== String(view.metadata?.name ?? '')) {
      out.push({ label: 'Nama SOP', current: String(curMeta.name ?? ''), viewed: String(view.metadata?.name ?? '') })
    }
    if (String(curMeta.number ?? '') !== String(view.metadata?.number ?? '')) {
      out.push({ label: 'Nomor SOP', current: String(curMeta.number ?? ''), viewed: String(view.metadata?.number ?? '') })
    }
    if (Number(curMeta.version) !== Number(view.metadata?.version)) {
      out.push({ label: 'Versi', current: String(curMeta.version ?? ''), viewed: String(view.metadata?.version ?? '') })
    }
    const curRows = prosedurRows
    const viewRows = view.prosedurRows ?? []
    if (curRows.length !== viewRows.length) {
      out.push({ label: 'Jumlah langkah', current: String(curRows.length), viewed: String(viewRows.length) })
    }
    const maxRows = Math.max(curRows.length, viewRows.length)
    for (let i = 0; i < maxRows; i++) {
      const rCur = curRows[i]
      const rView = viewRows[i]
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
  }, [viewingVersion])

  const handleAddComment = () => {
    if (!newComment.trim()) {
      showToast('Komentar harus diisi', 'error')
      return
    }
    setKomentarList([
      {
        id: String(Date.now()),
        user: SEED_DETAIL_SOP_CURRENT_USER.user,
        role: SEED_DETAIL_SOP_CURRENT_USER.role,
        timestamp: new Date().toLocaleString('id-ID'),
        bagian: '',
        isi: newComment.trim(),
        status: 'open',
      },
      ...komentarList,
    ])
    setNewComment('')
    showToast('Komentar berhasil ditambahkan')
  }

  const handleResolveComment = (commentId: string) => {
    setKomentarList(
      komentarList.map((k) =>
        k.id === commentId ? { ...k, status: 'resolved' as const } : k
      )
    )
    showToast('Komentar ditandai sebagai resolved')
  }

  const handleMengesahkanClick = () => {
    const profile = getTTEProfile('kepala-opd')
    if (!profile || !profile.emailVerified) {
      return
    }
    setPinDialogOpen(true)
  }

  const tteProfile = getTTEProfile('kepala-opd')
  const canMengesahkanWithTTE = tteProfile?.emailVerified === true

  const handlePinConfirm = (pin: string): boolean => {
    const profile = getTTEProfile('kepala-opd')
    if (!profile || !verifyPin(pin, profile.pinHash)) return false
    if (!id) return false
    const payload = addTTESignature(
      'kepala-opd',
      profile.nip,
      profile.nama,
      id,
      metadata.name,
      metadata.number || id
    )
    setTtePayload(payload)
    setSopStatusOverride(id, 'Berlaku')
    showToast('SOP berhasil disahkan dengan TTE BSRE.')
    setPinDialogOpen(false)
    return true
  }


  const komentarTampil = komentarList.filter((k) => k.role !== 'Tim Penyusun')
  const openComments = komentarTampil.filter((k) => k.status === 'open').length
  const resolvedComments = komentarTampil.filter((k) => k.status === 'resolved').length

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] min-h-0 gap-3">
      <PageHeader
        breadcrumb={[
          { label: 'Daftar SOP', to: '/kepala-opd/daftar-sop' },
          { label: 'Detail SOP' },
        ]}
        title="Detail Dokumen SOP"
        description={metadata.name}
        leading={
          <BackButton size="icon" onClick={() => navigate({ to: '/kepala-opd/daftar-sop' })} />
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 text-xs border-0">
              Versi {versions[0]?.version || '1.0'}
            </Badge>
            <Badge className="bg-green-100 text-green-700 text-xs border-0">{sopStatus}</Badge>
            {sopStatus === 'Terverifikasi dari Kepala Biro' && (
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={handleMengesahkanClick}
                disabled={!canMengesahkanWithTTE}
                title={!canMengesahkanWithTTE ? 'Setup TTE terlebih dahulu' : 'Mengesahkan SOP dengan TTE BSRE'}
              >
                Mengesahkan
              </Button>
            )}
          </div>
        }
      />

      <DetailWorkspace
        className="print:hidden"
        header={
          (penugasanState?.waktuPenugasan ?? penugasanState?.unitTerkait ?? penugasanState?.timPenyusun ?? penugasanState?.deskripsiProyek) ? (
            <div className="flex">
              <div className="flex-1 px-4 py-3">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                  <div className="p-1.5 rounded-md bg-gray-100">
                    <FileText className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Informasi penugasan
                  </h3>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {penugasanState.waktuPenugasan && (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Waktu
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {penugasanState.waktuPenugasan.includes('-')
                          ? new Date(penugasanState.waktuPenugasan + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : penugasanState.waktuPenugasan}
                      </span>
                    </div>
                  )}
                  {penugasanState.unitTerkait && (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        Unit
                      </span>
                      <span className="text-sm font-medium text-gray-900">{penugasanState.unitTerkait}</span>
                    </div>
                  )}
                  {penugasanState.timPenyusun && (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        Tim
                      </span>
                      <span className="text-sm font-medium text-gray-900">{penugasanState.timPenyusun}</span>
                    </div>
                  )}
                  {penugasanState.terakhirDiperbarui && (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
                        <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                        Diperbarui
                      </span>
                      <span className="text-sm font-medium text-gray-900">{penugasanState.terakhirDiperbarui}</span>
                    </div>
                  )}
                </div>
                {penugasanState.deskripsiProyek && (
                  <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 leading-relaxed max-w-full" title={penugasanState.deskripsiProyek}>
                    {penugasanState.deskripsiProyek}
                  </p>
                )}
              </div>
            </div>
          ) : undefined
        }
        main={
          <div className="flex flex-col h-full p-4">
            <SOPPreviewTemplate
              metadata={metadata}
              prosedurRows={prosedurRows}
              implementers={implementers}
              tteSignaturePayload={ttePayload}
              activeTab={activeTab}
              onActiveTabChange={setActiveTab}
            />
          </div>
        }
        rightPanel={
          <CollapsibleSidePanel
            side="right"
            collapsed={isRightPanelCollapsed}
            onCollapsedChange={setIsRightPanelCollapsed}
            widthCollapsed="w-10 min-w-[2.5rem]"
            widthExpanded="w-[min(320px,28%)] min-w-[220px]"
            collapseButtonLabel="Komentar"
            collapseButtonIcon={<MessageSquare className="w-4 h-4 text-gray-500" />}
            tabs={[
              {
                id: 'komentar',
                label: 'Komentar',
                icon: <MessageSquare className="w-3.5 h-3.5" />,
                badge: openComments > 0 || resolvedComments > 0 ? `(${openComments}/${resolvedComments})` : undefined,
              },
              { id: 'riwayat', label: 'Riwayat', icon: <History className="w-3.5 h-3.5" /> },
            ]}
            activeTab={rightPanelTab}
            onTabChange={(id) => setRightPanelTab(id as 'komentar' | 'riwayat')}
          >
            {rightPanelTab === 'komentar' && (
              <KomentarPanel
                comments={komentarTampil.map((k) => ({
                  id: k.id,
                  user: k.user,
                  role: k.role,
                  status: k.status,
                  bagian: k.bagian,
                  isi: k.isi,
                  timestamp: k.timestamp,
                }))}
                onResolve={handleResolveComment}
                addForm={{
                  value: newComment,
                  onChange: setNewComment,
                  onSubmit: handleAddComment,
                  submitLabel: 'Kirim Komentar',
                }}
                avatarVariant="orange"
              />
            )}
            {rightPanelTab === 'riwayat' && (
              <VersionHistoryPanel
                variant="cards"
                versions={versions.map((v: Version) => ({
                  id: v.id,
                  version: v.version,
                  date: v.date,
                  author: v.author,
                  changes: v.changes,
                  eventLabel: v.eventLabel,
                  revisionType: v.revisionType,
                  snapshot: v.snapshot,
                }))}
                viewingVersion={viewingVersion}
                setViewingVersion={(v) => setViewingVersion(v as Version | null)}
                versionDiff={versionDiff}
              />
            )}
          </CollapsibleSidePanel>
        }
      />

      <PinVerificationDialog
        open={pinDialogOpen}
        onOpenChange={setPinDialogOpen}
        title="Verifikasi PIN TTE"
        description="Masukkan PIN TTE BSRE untuk mengesahkan SOP ini."
        onConfirm={handlePinConfirm}
        confirmLabel="Mengesahkan"
      />
    </div>
  )
}
