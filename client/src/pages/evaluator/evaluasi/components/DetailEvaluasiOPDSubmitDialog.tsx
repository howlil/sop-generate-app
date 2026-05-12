import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { InfoCard } from "@/components/ui/info-card";
import type { AjukanEvaluasiSnapshotRow } from "@/api/evaluasi";
import type { EvaluasiBatchSubmitError } from "@/types/dto/evaluasi.dto";

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
  terjadwalSubmitError?: EvaluasiBatchSubmitError;
}

export function DetailEvaluasiOPDSubmitDialog({
  open,
  onOpenChange,
  snapshotRows,
  canConfirm,
  blockingReason,
  onConfirm,
  isSubmitting = false,
  requiresNilaiOpdInCopy = true,
  terjadwalSubmitError = { kind: "none", items: [] },
}: DetailEvaluasiOPDSubmitDialogProps) {
  const serverMessage =
    terjadwalSubmitError.kind === "blocked" || terjadwalSubmitError.kind === "incomplete"
      ? terjadwalSubmitError.message
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-sm">Ajukan hasil ke PJ Evaluator</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Pengajuan hanya dapat diselesaikan jika{" "}
            <strong>semua SOP dalam pengajuan bernilai Sesuai</strong> (tersimpan di server)
            {requiresNilaiOpdInCopy ? (
              <>
                {" "}
                dan <strong>skor evaluasi OPD (1–5)</strong> sudah diisi di tab Evaluasi OPD.
              </>
            ) : (
              <>.</>
            )}{" "}
            SOP <strong>Perlu Perbaikan</strong> dikembalikan ke penyusun melalui catatan
            formal pada tab Evaluasi SOP — bukan lewat dialog ini.
          </p>
          {serverMessage ? (
            <InfoCard variant="warning" className="border-red-200 bg-red-50 text-red-900">
              <p className="text-sm font-medium">{serverMessage}</p>
            </InfoCard>
          ) : null}
          {!canConfirm && blockingReason ? (
            <InfoCard variant="warning">
              <p className="text-xs text-amber-900">{blockingReason}</p>
            </InfoCard>
          ) : null}
          {snapshotRows.length === 0 ? (
            <InfoCard variant="warning">
              <p className="text-sm text-amber-800">
                Tidak ada dokumen dalam pengajuan evaluasi aktif untuk OPD ini.
              </p>
            </InfoCard>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 max-h-52 overflow-auto scrollbar-hide">
              <p className="text-[10px] font-semibold text-gray-600 mb-2">
                Ringkasan nilai per dokumen (termasuk draf SOP terpilih)
              </p>
              <ul className="space-y-1.5 text-xs">
                {snapshotRows.map((row) => (
                  <li
                    key={row.detailSopId}
                    className="flex flex-col gap-0.5 py-1.5 border-b border-gray-100 last:border-0"
                  >
                    <span className="font-medium text-gray-900">{row.judul}</span>
                    <span className="text-gray-500 font-mono">{row.nomorSOP}</span>
                    <span className="text-[10px] text-blue-700 font-medium">
                      → {row.hasilLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <InfoCard variant="warning">
            <p className="text-xs text-amber-800">
              Setelah diajukan, pengajuan ini berstatus selesai dievaluasi dan dokumen yang
              Sesuai akan maju ke tahap verifikasi sesuai alur Biro.
            </p>
          </InfoCard>
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
            disabled={
              snapshotRows.length === 0 || !canConfirm || isSubmitting
            }
          >
            <Send className="w-3.5 h-3.5" /> Ya, ajukan ke PJ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
