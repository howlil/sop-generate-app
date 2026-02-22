import { useState } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { List, MessageSquare, Play } from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { SOPListCard } from '@/components/sop/SOPListCard'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { StatusBadge } from '@/components/ui/status-badge'
import { NotFoundWithBack } from '@/components/ui/not-found'
import { PageHeader } from '@/components/layout/PageHeader'
import { DetailWorkspace } from '@/components/layout/DetailWorkspace'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { SEED_PENUGASAN_DETAIL_BY_ID } from '@/lib/seed/penugasan-detail-seed'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'

export function DetailPenugasanTimEvaluasi() {
  const { id } = useParams({ from: '/tim-evaluasi/penugasan/detail/$id' })
  const navigate = useNavigate()
  const penugasan = id ? SEED_PENUGASAN_DETAIL_BY_ID[id] ?? null : null
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  if (!penugasan) {
    return (
      <NotFoundWithBack
        message="Penugasan tidak ditemukan."
        backAction={
          <BackButton onClick={() => navigate({ to: '/tim-evaluasi/penugasan' })}>
            Kembali
          </BackButton>
        }
      />
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] min-h-0">
      <PageHeader
        breadcrumb={[
          { label: 'Penugasan Evaluasi', to: '/tim-evaluasi/penugasan' },
          { label: 'Detail Penugasan' },
        ]}
        title={penugasan.sop}
        description={`${penugasan.kodeSOP} • ${penugasan.opd}`}
        leading={
          <BackButton
            size="icon"
            onClick={() => navigate({ to: '/tim-evaluasi/penugasan' })}
          />
        }
      />

      <DetailWorkspace
        header={
          <>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">Informasi penugasan</h2>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-900">{penugasan.opd}</span>
              <StatusBadge status={penugasan.status} domain={STATUS_DOMAIN.PENUGASAN_EVALUASI} className="text-xs h-4 px-1.5 border-0" />
              <span className="text-xs text-gray-700">{penugasan.sop}</span>
              <span className="text-[10px] text-gray-500 font-mono">{penugasan.kodeSOP}</span>
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
            subtitle="1 dokumen"
            collapseButtonLabel="Daftar"
            collapseButtonIcon={<List className="w-5 h-5" />}
          >
            <SOPListCard
              items={[{ id: penugasan.id, nama: penugasan.sop, nomor: penugasan.kodeSOP }]}
            />
          </CollapsibleSidePanel>
        }
        main={
          <div className="flex flex-col h-full">
            <div className="p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h3 className="text-xs font-semibold text-gray-700">Preview SOP</h3>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <SOPPreviewTemplate name={penugasan.sop} number={penugasan.kodeSOP} />
            </div>
          </div>
        }
        rightPanel={
          <CollapsibleSidePanel
            side="right"
            collapsed={rightPanelCollapsed}
            onCollapsedChange={setRightPanelCollapsed}
            widthExpanded="w-[min(380px,33%)] min-w-[280px]"
            title="Preview"
            collapseButtonLabel="Preview"
            collapseButtonIcon={<MessageSquare className="w-5 h-5" />}
          >
            <div className="p-3 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs">
                <p className="font-semibold text-blue-900 mb-1">Instruksi Evaluasi:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-blue-800">
                  <li>Lakukan review SOP secara menyeluruh dan objektif</li>
                  <li>Dokumentasikan temuan dengan detail dan terstruktur</li>
                  <li>Berikan rekomendasi yang konstruktif dan dapat ditindaklanjuti</li>
                  <li>Tetapkan status Sesuai/Revisi Biro berdasarkan hasil review</li>
                  <li>Submit hasil evaluasi setelah selesai</li>
                </ul>
              </div>

              {penugasan.status !== 'completed' && (
                <Link to="/tim-evaluasi/pelaksanaan/$id" params={{ id: penugasan.id }}>
                  <Button size="sm" className="w-full h-9 text-xs gap-1.5">
                    <Play className="w-3.5 h-3.5" />
                    {penugasan.status === 'assigned' ? 'Mulai Evaluasi' : 'Lanjutkan Evaluasi'}
                  </Button>
                </Link>
              )}
            </div>
          </CollapsibleSidePanel>
        }
      />
    </div>
  )
}
