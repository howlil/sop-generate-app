import { Link } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SopStatusBadge } from '@/components/status/sop-status-badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useHapusVersiDraft, useRiwayatVersi } from '@/api/sop'
import { ROUTES } from '@/utils/constants'
import type { StatusSOP } from '@/types/dto/sop.dto'
import { useState } from 'react'
import { formatDateIdLong } from '@/utils/format-date'

export interface RiwayatVersiPanelProps {
  sopId: string
  activeDetailSopId?: string
  isReadOnly?: boolean
}

export function RiwayatVersiPanel({
  sopId,
  activeDetailSopId,
  isReadOnly = false,
}: RiwayatVersiPanelProps) {
  const { data: rows = [], isLoading } = useRiwayatVersi(sopId)
  const { mutateAsync: hapusDraft, isPending: isDeleting } = useHapusVersiDraft(sopId)
  const [hapusTarget, setHapusTarget] = useState<string | null>(null)

  if (isLoading) {
    return <p className="p-3 text-xs text-gray-500">Memuat riwayat versi…</p>
  }

  if (rows.length === 0) {
    return <p className="p-3 text-xs text-gray-500">Belum ada versi untuk SOP ini.</p>
  }

  return (
    <div className="p-3 space-y-2">
      <p className="text-xs font-medium text-gray-700">Riwayat versi dokumen</p>
      <ul className="space-y-2">
        {rows.map((row) => {
          const isActive = row.detailSopId === activeDetailSopId
          return (
            <li
              key={row.detailSopId}
              className={`rounded-md border p-2 text-xs ${isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono font-medium text-gray-900">
                    v{row.versi} · {row.nomorSOP}
                  </p>
                  {row.revisiDariVersi != null ? (
                    <p className="text-gray-500 mt-0.5">Revisi dari v{row.revisiDariVersi}</p>
                  ) : null}
                  <p className="text-gray-400 mt-0.5">{formatDateIdLong(row.updatedAt)}</p>
                </div>
                <SopStatusBadge
                  status={row.status as StatusSOP}
                  label={row.statusLabel}
                  showDomain={false}
                  className="text-[10px]"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                  <Link
                    to={ROUTES.PENYUSUN.DETAIL_SOP}
                    params={{ id: row.detailSopId }}
                  >
                    {isActive ? 'Sedang dibuka' : 'Buka'}
                  </Link>
                </Button>
                {!isReadOnly && row.canHapusDraft ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-red-700 border-red-200"
                    onClick={() => setHapusTarget(row.detailSopId)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-3 h-3 mr-1" aria-hidden />
                    Hapus draft
                  </Button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
      <ConfirmDialog
        open={hapusTarget != null}
        onOpenChange={(open) => {
          if (!open) setHapusTarget(null)
        }}
        title="Hapus versi draft?"
        description="Versi draft revisi akan dihapus permanen. Versi yang berlaku tidak terpengaruh."
        confirmLabel="Hapus"
        destructive
        onConfirm={() => {
          if (hapusTarget == null) return
          void hapusDraft(hapusTarget).then(() => setHapusTarget(null))
        }}
      />
    </div>
  )
}
