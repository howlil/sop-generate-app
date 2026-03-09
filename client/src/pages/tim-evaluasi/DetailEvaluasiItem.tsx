import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { List, MessageSquare, Play } from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { SOPListCard } from '@/components/sop/SOPListCard'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { StatusBadge } from '@/components/ui/status-badge'
import { NotFoundWithBack } from '@/components/ui/not-found'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { ROUTES } from '@/lib/constants/routes'
import { getEvaluasiDetailById } from '@/lib/data/evaluasi-detail'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'

export function DetailEvaluasiItem() {
  const { id } = useParams({ from: '/tim-evaluasi/evaluasi/detail/$id' })
  const item = id ? (getEvaluasiDetailById(id) ?? null) : null
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  if (!item) {
    return (
      <NotFoundWithBack
        message="Data evaluasi tidak ditemukan."
        backAction={
          <BackButton to={ROUTES.TIM_EVALUASI.EVALUASI}>Kembali</BackButton>
        }
      />
    )
  }

  return (
    <DetailPageLayout
      breadcrumb={[
        { label: 'Evaluasi SOP', to: ROUTES.TIM_EVALUASI.EVALUASI },
        { label: 'Detail' },
      ]}
      title={item.sop}
      description={`${item.kodeSOP} • ${item.opd}`}
      backTo={ROUTES.TIM_EVALUASI.EVALUASI}
      backSize="icon"
      header={
          <>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">Informasi evaluasi</h2>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-900">{item.opd}</span>
              <StatusBadge status={item.status} domain={STATUS_DOMAIN.EVALUASI_ITEM} className="text-xs h-4 px-1.5 border-0" />
              <span className="text-xs text-gray-700">{item.sop}</span>
              <span className="text-[10px] text-gray-500 font-mono">{item.kodeSOP}</span>
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
              items={[{ id: item.id, nama: item.sop, nomor: item.kodeSOP }]}
            />
          </CollapsibleSidePanel>
        }
        main={
          <div className="flex flex-col h-full">
            <div className="p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h3 className="text-xs font-semibold text-gray-700">Preview SOP</h3>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <SOPPreviewTemplate name={item.sop} number={item.kodeSOP} />
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
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                <p className="font-semibold text-blue-900 mb-1">Instruksi Evaluasi:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-blue-800">
                  <li>Lakukan review SOP secara menyeluruh dan objektif</li>
                  <li>Dokumentasikan temuan dengan detail dan terstruktur</li>
                  <li>Berikan rekomendasi yang konstruktif dan dapat ditindaklanjuti</li>
                  <li>Tetapkan status Sesuai/Revisi Biro berdasarkan hasil review</li>
                  <li>Submit hasil evaluasi setelah selesai</li>
                </ul>
              </div>

              {item.status !== 'completed' && (
                <Link to={ROUTES.TIM_EVALUASI.PELAKSANAAN} params={{ id: item.id }}>
                  <Button size="sm" className="w-full h-9 text-xs gap-1.5">
                    <Play className="w-3.5 h-3.5" />
                    {item.status === 'assigned' ? 'Mulai Evaluasi' : 'Lanjutkan Evaluasi'}
                  </Button>
                </Link>
              )}
            </div>
          </CollapsibleSidePanel>
        }
    />
  )
}
