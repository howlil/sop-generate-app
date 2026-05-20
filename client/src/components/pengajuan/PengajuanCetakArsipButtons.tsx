import { Loader2, MoreVertical, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CETAK_ARSIP_DISABLED_TITLE,
  canCetakArsipPengajuan,
  type PengajuanPrintTarget,
} from '@/lib/print/pengajuan-print'

interface PengajuanCetakArsipButtonsProps {
  pengajuanStatus: string | undefined
  effectiveSopDetailId: string | null
  sopCount: number
  cetakLoading?: boolean
  semuaSopLoading?: boolean
  onCetak: (target: PengajuanPrintTarget) => void | Promise<void>
}

export function PengajuanCetakArsipButtons({
  pengajuanStatus,
  effectiveSopDetailId,
  sopCount,
  cetakLoading = false,
  semuaSopLoading = false,
  onCetak,
}: PengajuanCetakArsipButtonsProps) {
  const canCetak = canCetakArsipPengajuan(pengajuanStatus)
  const disabledTitle = canCetak ? undefined : CETAK_ARSIP_DISABLED_TITLE
  const sopItemDisabled = !canCetak || effectiveSopDetailId === null || cetakLoading
  const sopItemTitle =
    !canCetak
      ? disabledTitle
      : effectiveSopDetailId === null
        ? 'Pilih SOP untuk dicetak'
        : undefined
  const semuaSopItemDisabled =
    !canCetak || sopCount === 0 || semuaSopLoading || cetakLoading
  const triggerDisabled = !canCetak || cetakLoading

  const handleSelect = (target: PengajuanPrintTarget) => {
    void onCetak(target)
  }

  return (
    <div data-print-hide>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={triggerDisabled}
            title={disabledTitle}
            aria-label="Cetak arsip"
          >
            {cetakLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <MoreVertical className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[11rem]">
          <DropdownMenuItem
            disabled={!canCetak || cetakLoading}
            title={disabledTitle}
            onClick={() => handleSelect('ba')}
          >
            <Printer className="mr-2 h-3.5 w-3.5 shrink-0 text-gray-500" aria-hidden />
            Cetak BA
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={sopItemDisabled}
            title={sopItemTitle}
            onClick={() => handleSelect('sop')}
          >
            <Printer className="mr-2 h-3.5 w-3.5 shrink-0 text-gray-500" aria-hidden />
            Cetak SOP
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={semuaSopItemDisabled}
            title={disabledTitle}
            onClick={() => handleSelect('sop-all')}
          >
            {semuaSopLoading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
            ) : (
              <Printer className="mr-2 h-3.5 w-3.5 shrink-0 text-gray-500" aria-hidden />
            )}
            Cetak semua SOP
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
