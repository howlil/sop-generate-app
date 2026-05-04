import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useKepalaOpdRiwayat } from '@/api/kepala-opd'
import { formatDateIdLong } from '@/utils/format-date'

export interface KepalaOpdRiwayatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  penggunaId: string | null
  namaKepala: string
}

export function KepalaOpdRiwayatDialog({
  open,
  onOpenChange,
  penggunaId,
  namaKepala,
}: KepalaOpdRiwayatDialogProps) {
  const { data: rows, isLoading } = useKepalaOpdRiwayat(penggunaId, open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">Riwayat penugasan OPD</DialogTitle>
          <p className="text-xs text-gray-500">{namaKepala}</p>
        </DialogHeader>
        <div className="space-y-2 text-xs">
          {isLoading && <p className="text-gray-500">Memuat…</p>}
          {!isLoading && rows?.length === 0 && (
            <p className="text-gray-500">Belum ada riwayat OPD tercatat.</p>
          )}
          {!isLoading &&
            rows?.map((r) => (
              <div
                key={r.opdId}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex justify-between gap-2"
              >
                <span className="font-medium text-gray-900">{r.namaOpd}</span>
                <span className="text-gray-500 shrink-0">
                  {formatDateIdLong(r.diperbaruiPada)}
                </span>
              </div>
            ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
