import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { AjukanEvaluasiSnapshotRow } from "@/api/evaluasi";
import type { PengajuanEvaluasiSubmitError } from "@/types/dto/evaluasi.dto";

export interface DetailEvaluasiOPDSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshotRows: AjukanEvaluasiSnapshotRow[];
  canConfirm: boolean;
  blockingReason: string | null;
  onConfirm: () => void;
  isSubmitting?: boolean;
  /** false untuk pengajuan MANDIRI — teks bantuan tanpa syarat skor OPD. */
  requiresNilaiOpdInCopy?: boolean;
  /** Error validasi / server terakhir (ditampilkan di dalam dialog). */
  terjadwalSubmitError?: PengajuanEvaluasiSubmitError;
}

export function DetailEvaluasiOPDSubmitDialog({
  open,
  onOpenChange,
  snapshotRows,
  canConfirm,
  blockingReason,
  onConfirm,
  isSubmitting = false,
  terjadwalSubmitError = { kind: "none", items: [] },
}: DetailEvaluasiOPDSubmitDialogProps) {
  const serverMessage =
    terjadwalSubmitError.kind === "blocked" || terjadwalSubmitError.kind === "incomplete"
      ? terjadwalSubmitError.message
      : null;
  const alertMessage = serverMessage ?? (!canConfirm ? blockingReason : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Ajukan hasil ke PJ Evaluator</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {alertMessage ? (
            <p className="text-xs text-amber-900 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
              {alertMessage}
            </p>
          ) : null}
          {snapshotRows.length === 0 ? (
            <p className="text-xs text-gray-500">Tidak ada dokumen dalam pengajuan ini.</p>
          ) : (
            <ul className="max-h-52 overflow-auto rounded-md border border-gray-200 divide-y divide-gray-100 text-xs scrollbar-hide">
              {snapshotRows.map((row) => (
                <li
                  key={row.detailSopId}
                  className="flex items-start justify-between gap-3 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{row.judul}</p>
                    <p className="text-[10px] text-gray-500 font-mono truncate">{row.nomorSOP}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium text-gray-700">
                    {row.hasilLabel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={onConfirm}
            disabled={snapshotRows.length === 0 || !canConfirm || isSubmitting}
          >
            <Send className="w-3.5 h-3.5" /> Ya, ajukan ke PJ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
