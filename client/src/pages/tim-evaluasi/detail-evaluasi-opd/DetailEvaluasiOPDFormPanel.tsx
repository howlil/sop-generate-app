import { FileText, Building2, MessageSquare } from 'lucide-react'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { RiwayatCardList, StatusHasilEvaluasiPicker, SkorRatingPicker } from '@/features/evaluasi'
import { formatDateId } from '@/utils/format-date'
import type { RiwayatEvaluasiSOPItem, RiwayatEvaluasiOPDItem } from '@/features/evaluasi'
import type { StatusHasilEvaluasi } from '@/features/evaluasi'

export interface DetailEvaluasiOPDFormPanelProps {
  opd: { id: string; nama: string; kode: string } | null
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  activeFormTab: 'sop' | 'opd'
  onTabChange: (id: 'sop' | 'opd') => void
  effectiveSopId: string | null
  lastEvaluatedBy: Record<string, { date: string; evaluatorName: string }>
  statusEvaluasi: StatusHasilEvaluasi | null
  setStatusEvaluasi: (v: StatusHasilEvaluasi) => void
  komentarEvaluasi: string
  setKomentarEvaluasi: (v: string) => void
  riwayatSop: RiwayatEvaluasiSOPItem[]
  riwayatOpd: RiwayatEvaluasiOPDItem[]
  ratingOPD: number | null
  setRatingOPD: (v: number | null) => void
}

export function DetailEvaluasiOPDFormPanel({
  opd,
  collapsed,
  onCollapsedChange,
  activeFormTab,
  onTabChange,
  effectiveSopId,
  lastEvaluatedBy,
  statusEvaluasi,
  setStatusEvaluasi,
  komentarEvaluasi,
  setKomentarEvaluasi,
  riwayatSop,
  riwayatOpd,
  ratingOPD,
  setRatingOPD,
}: DetailEvaluasiOPDFormPanelProps) {
  return (
    <CollapsibleSidePanel
      side="right"
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      widthExpanded="w-full"
      tabs={[
        { id: 'sop', label: 'Evaluasi SOP', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'opd', label: 'Evaluasi OPD', icon: <Building2 className="w-3.5 h-3.5" /> },
      ]}
      activeTab={activeFormTab}
      onTabChange={(id) => onTabChange(id as 'sop' | 'opd')}
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
                        placeholder="Komentar evaluasi (wajib jika Perlu Perbaikan)..."
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
                          <span className="font-medium text-gray-700">{formatDateId(r.createdAt)}</span>
                          <span className="text-gray-500">—</span>
                          <span className="text-gray-600">{r.dinilaiOleh?.nama ?? '-'}</span>
                          <span className={r.hasil === 'SESUAI' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                            · {r.hasil}
                          </span>
                        </div>
                        {r.catatan && <p className="text-gray-600 mt-1 leading-snug">{r.catatan}</p>}
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
                          <span className="font-medium text-gray-700">{formatDateId(r.tanggalEvaluasi ?? r.createdAt)}</span>
                          <span className="text-gray-500">—</span>
                          <span className="text-gray-600">{r.opdNama ?? '-'}</span>
                          {r.nilaiOPD != null && (
                            <span className="text-blue-600 font-medium">Skor {r.nilaiOPD}/5</span>
                          )}
                        </div>
                        {r.catatan && (
                          <p className="text-gray-600 mt-1 leading-snug truncate" title={r.catatan}>
                            {r.catatan}
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
  )
}
