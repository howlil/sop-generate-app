/**
 * Dialog riwayat penempatan OPD — GET /api/v1/penyusun/:id/riwayat-opd
 */
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { penyusunApi } from '@/api/penyusun'
import { queryKeys } from '@/config/query-keys'
import { STALE_TIME } from '@/utils/constants'

function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export interface RiwayatOpdPenyusunDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  penggunaId: string | null
  namaPenyusun: string
}

export function RiwayatOpdPenyusunDialog({
  open,
  onOpenChange,
  penggunaId,
  namaPenyusun,
}: RiwayatOpdPenyusunDialogProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.penyusunRiwayatOpd(penggunaId ?? ''),
    queryFn: () => penyusunApi.getRiwayatOpd(penggunaId!),
    enabled: open && penggunaId != null,
    staleTime: STALE_TIME.MEDIUM,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Riwayat OPD — {namaPenyusun}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-600 max-h-[min(50vh,320px)] overflow-y-auto space-y-2">
          {isLoading && <p className="text-gray-500">Memuat riwayat…</p>}
          {isError && (
            <p className="text-red-600">Gagal memuat riwayat. Coba lagi.</p>
          )}
          {!isLoading && !isError && data && data.length === 0 && (
            <p className="text-gray-500">
              Belum ada riwayat tercatat. Riwayat terisi saat penyusun baru ditambahkan atau
              dipindahkan ke OPD lain.
            </p>
          )}
          {!isLoading &&
            !isError &&
            data?.map((r) => (
              <div
                key={r.opdId}
                className="rounded-md border border-gray-100 bg-gray-50/80 px-3 py-2"
              >
                <p className="font-medium text-gray-900">{r.namaOpd}</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Pertama dicatat: {formatTanggal(r.pertamaDicatat)}
                </p>
                <p className="text-[11px] text-gray-500">
                  Terakhir diperbarui: {formatTanggal(r.terakhirDiperbarui)}
                </p>
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
