import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { InfoCard } from '@/components/ui/info-card'
import { STATUS_HASIL_EVALUASI } from '@/lib/domain/evaluasi'

export interface SedangDievaluasiItem {
  id: string
  judul: string
  nomorSOP: string
  statusEvaluasi: 'Sesuai' | 'Revisi Biro'
  komentarEvaluasi: string
}

export interface DetailEvaluasiOPDSubmitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sedangDievaluasiList: SedangDievaluasiItem[]
  submitSelectedIds: Set<string>
  toggleSubmitSelected: (id: string) => void
  isSubmitCheckAll: boolean
  isSubmitCheckAllIndeterminate: boolean
  setSubmitCheckAll: (checked: boolean) => void
  onConfirm: () => void
}

export function DetailEvaluasiOPDSubmitDialog({
  open,
  onOpenChange,
  sedangDievaluasiList,
  submitSelectedIds,
  toggleSubmitSelected,
  isSubmitCheckAll,
  isSubmitCheckAllIndeterminate,
  setSubmitCheckAll,
  onConfirm,
}: DetailEvaluasiOPDSubmitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-sm">Kirim Hasil Evaluasi</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            SOP yang sudah diisi <strong>status hasil</strong> (Sesuai/Revisi Biro) di form kanan akan muncul di bawah. Centang yang akan dikirim. Jika hasil <strong>Revisi Biro</strong>, wajib isi komentar sebelum kirim.
          </p>
          {sedangDievaluasiList.length === 0 ? (
            <InfoCard variant="warning">
              <p className="text-sm text-amber-800">
                Belum ada SOP yang sudah diisi form. Pilih SOP dengan status <strong>Diajukan Evaluasi</strong> di daftar kiri, isi <strong>status hasil</strong> (Sesuai atau Revisi Biro) di panel kanan, lalu buka popup ini lagi.
              </p>
            </InfoCard>
          ) : (
            <>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 max-h-52 overflow-auto scrollbar-hide">
                <div className="flex items-center gap-2 mb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={isSubmitCheckAll}
                      ref={(el) => {
                        if (el) el.indeterminate = isSubmitCheckAllIndeterminate
                      }}
                      onChange={(e) => setSubmitCheckAll(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Centang semua
                  </label>
                  <span className="text-[10px] text-gray-500">
                    ({submitSelectedIds.size} / {sedangDievaluasiList.length} dipilih)
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs">
                  {sedangDievaluasiList.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 py-1.5 border-b border-gray-100 last:border-0">
                      <input
                        type="checkbox"
                        id={`submit-sop-${item.id}`}
                        checked={submitSelectedIds.has(item.id)}
                        onChange={() => toggleSubmitSelected(item.id)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`submit-sop-${item.id}`} className="flex flex-col gap-0.5 cursor-pointer flex-1 min-w-0">
                        <span className="font-medium text-gray-900">{item.judul}</span>
                        <span className="text-gray-500 font-mono">{item.nomorSOP}</span>
                        <span className="text-[10px] text-blue-700 font-medium">→ {STATUS_HASIL_EVALUASI[item.statusEvaluasi]}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <InfoCard variant="warning">
                <p className="text-xs text-amber-800">
                  <strong>Perhatian:</strong> Setelah dikirim, hasil evaluasi tidak dapat diubah.
                </p>
              </InfoCard>
            </>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={onConfirm}
            disabled={sedangDievaluasiList.length === 0 || submitSelectedIds.size === 0}
          >
            <Send className="w-3.5 h-3.5" /> Ya, Kirim Hasil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
