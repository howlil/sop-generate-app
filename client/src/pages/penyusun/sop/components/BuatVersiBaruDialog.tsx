import { GitBranchPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface BuatVersiBaruDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  judulSop: string
  versiSaatIni: number
  isPending?: boolean
  onConfirm: () => void | Promise<void>
}

export function BuatVersiBaruDialog({
  open,
  onOpenChange,
  judulSop,
  versiSaatIni,
  isPending = false,
  onConfirm,
}: BuatVersiBaruDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranchPlus className="w-4 h-4" aria-hidden />
            Buat versi baru
          </DialogTitle>
          <DialogDescription>
            Versi {versiSaatIni} yang berlaku akan tetap resmi. Sistem menyalin isi dokumen ke
            versi {versiSaatIni + 1} (status DRAFT) untuk diedit dan diajukan evaluasi ulang.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-gray-700">
          SOP: <span className="font-medium text-gray-900">{judulSop}</span>
        </p>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Batal
          </Button>
          <Button type="button" onClick={() => void onConfirm()} disabled={isPending}>
            {isPending ? 'Membuat…' : 'Buat versi baru'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
