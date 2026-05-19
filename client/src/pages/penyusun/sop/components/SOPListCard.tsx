import { ItemListCard } from '@/components/ui/item-list-card'
import { SopEvaluasiStatusGroup } from '@/components/status/sop-evaluasi-status-group'
import { SopStatusBadge } from '@/components/status/sop-status-badge'
import type { TahapPenilaianSop } from '@/lib/evaluasi/evaluasi-domain'

export interface SOPListItem {
  id: string
  nama: string
  nomor: string
  statusDokumen?: string
  statusDokumenLabel?: string
  hasilEvaluasi?: string
  hasilEvaluasiLabel?: string
  statusTindakLanjut?: string | null
  statusTindakLanjutLabel?: string | null
  tahapPenilaian?: TahapPenilaianSop
}

export interface SOPListCardProps {
  items: SOPListItem[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  className?: string
  variant?: 'default' | 'compact'
}

function renderStatus(sop: SOPListItem) {
  const statusDokumen = sop.statusDokumen
  const statusDokumenLabel = sop.statusDokumenLabel
  if (!statusDokumen || !statusDokumenLabel) return null
  const hasPenilaian =
    sop.hasilEvaluasi !== undefined && sop.hasilEvaluasiLabel !== undefined
  if (hasPenilaian) {
    return (
      <SopEvaluasiStatusGroup
        statusDokumen={statusDokumen}
        statusDokumenLabel={statusDokumenLabel}
        hasilEvaluasi={sop.hasilEvaluasi}
        hasilEvaluasiLabel={sop.hasilEvaluasiLabel}
        statusTindakLanjut={sop.statusTindakLanjut}
        statusTindakLanjutLabel={sop.statusTindakLanjutLabel}
        tahapPenilaian={sop.tahapPenilaian}
      />
    )
  }
  return <SopStatusBadge status={statusDokumen} label={statusDokumenLabel} />
}

export function SOPListCard({
  items,
  selectedId = null,
  onSelect,
  className,
}: SOPListCardProps) {
  return (
    <ItemListCard<SOPListItem>
      items={items}
      getKey={(sop) => sop.id}
      renderPrimary={(sop) => sop.nama}
      renderSecondary={(sop) => renderStatus(sop)}
      emptyMessage="Tidak ada SOP"
      selectedId={selectedId}
      onSelect={onSelect}
      className={className}
    />
  )
}
