import { useCallback, useEffect, useMemo, useState } from "react";
import { useEvaluasi, useEvaluasiWorkspaceOpd } from "@/api/evaluasi";
import { useOpd } from "@/api/opd";
import type { JenisPengajuanEvaluasi } from "@/types/dto/evaluasi.dto";
import { FormDialog } from "@/components/ui/form-dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";

export interface BukaPengajuanEvaluasiDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

function toggleDetailId(
  prev: ReadonlySet<string>,
  detailSopId: string,
  checked: boolean,
): Set<string> {
  const next = new Set(prev);
  if (checked) {
    next.add(detailSopId);
  } else {
    next.delete(detailSopId);
  }
  return next;
}

export function BukaPengajuanEvaluasiDialog({
  open,
  onOpenChange,
}: BukaPengajuanEvaluasiDialogProps) {
  const { list: opdList, isLoading: isLoadingOpd } = useOpd();
  const [selectedOpdId, setSelectedOpdId] = useState("");
  const [selectedDetailIds, setSelectedDetailIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [jenis, setJenis] = useState<JenisPengajuanEvaluasi>("TERJADWAL");
  const { create, isCreating } = useEvaluasi({ enabled: false });
  const {
    data: workspace,
    isLoading: isLoadingWorkspace,
    isFetching: isFetchingWorkspace,
  } = useEvaluasiWorkspaceOpd(selectedOpdId, {
    enabled: open && selectedOpdId !== "",
  });

  useEffect(() => {
    if (open && selectedOpdId === "" && opdList.length > 0) {
      setSelectedOpdId(opdList[0].id);
    }
  }, [open, opdList, selectedOpdId]);

  useEffect(() => {
    if (!open) {
      setSelectedOpdId("");
      setSelectedDetailIds(new Set());
      setJenis("TERJADWAL");
    }
  }, [open]);

  const selectedOpd = useMemo(
    () => opdList.find((o) => o.id === selectedOpdId) ?? null,
    [opdList, selectedOpdId],
  );

  const hasBlockingPengajuan = workspace?.pengajuanAktif != null;
  const workspaceBusy = isLoadingWorkspace || isFetchingWorkspace;

  const handleConfirm = useCallback(() => {
    if (
      selectedOpdId === "" ||
      selectedDetailIds.size === 0 ||
      hasBlockingPengajuan
    ) {
      return;
    }
    void (async () => {
      await create({
        jenis,
        sopDetailIds: Array.from(selectedDetailIds),
      });
      onOpenChange(false);
    })();
  }, [
    create,
    hasBlockingPengajuan,
    jenis,
    onOpenChange,
    selectedDetailIds,
    selectedOpdId,
  ]);

  const confirmDisabled =
    selectedOpdId === "" ||
    selectedDetailIds.size === 0 ||
    hasBlockingPengajuan ||
    isCreating ||
    workspaceBusy;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buka pengajuan evaluasi"
      description="Pilih dokumen SOP yang akan dikirim ke evaluator."
      confirmLabel="Buat pengajuan"
      size="lg"
      onConfirm={handleConfirm}
      confirmDisabled={confirmDisabled}
      contentClassName="space-y-4"
    >
      <div className="space-y-1.5">
        <Label>OPD</Label>
        <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
          {isLoadingOpd
            ? "Memuat OPD..."
            : selectedOpd?.nama ?? "OPD tidak ditemukan untuk akun ini"}
        </p>
      </div>
      {hasBlockingPengajuan ? (
        <div
          role="status"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950"
        >
          OPD ini masih memiliki pengajuan evaluasi aktif. Selesaikan pengajuan
          tersebut terlebih dahulu sebelum membuka pengajuan baru.
        </div>
      ) : null}
      {selectedOpdId !== "" ? (
        <div className="space-y-1.5">
          <Label required>Dokumen SOP</Label>
          {workspaceBusy ? (
            <p className="text-xs text-gray-500">Memuat daftar SOP...</p>
          ) : (workspace?.daftarSop.length ?? 0) === 0 ? (
            <p className="text-xs text-gray-500">
              Tidak ada SOP dalam pipeline evaluasi untuk OPD ini.
            </p>
          ) : (
            <ul className="max-h-56 overflow-y-auto rounded-md border border-gray-200 divide-y divide-gray-100">
              {workspace?.daftarSop.map((row) => {
                const checked = selectedDetailIds.has(row.detailSopId);
                return (
                  <li key={row.detailSopId}>
                    <label className="flex items-start gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        className="mt-0.5 rounded border-gray-300"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedDetailIds((prev) =>
                            toggleDetailId(prev, row.detailSopId, e.target.checked),
                          );
                        }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-gray-900 block truncate">
                          {row.judul}
                        </span>
                        <span className="text-gray-500">
                          {row.nomorSOP} - {row.statusDetail}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
      <fieldset className="space-y-2 border-0 p-0 m-0">
        <legend className="text-xs font-medium text-gray-700 mb-1.5">
          Jenis pengajuan
        </legend>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            className={cn(
              "flex-1 rounded-md border px-3 py-2 text-left text-xs transition-colors",
              jenis === "TERJADWAL"
                ? "border-blue-600 bg-blue-50 text-blue-950"
                : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50",
            )}
            onClick={() => setJenis("TERJADWAL")}
          >
            <span className="font-semibold block">Terjadwal</span>
            <span className="text-[11px] text-gray-600 mt-0.5 block leading-snug">
              Evaluator wajib mengisi skor OPD (1-5) saat menyelesaikan
              pengajuan.
            </span>
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 rounded-md border px-3 py-2 text-left text-xs transition-colors",
              jenis === "MANDIRI"
                ? "border-blue-600 bg-blue-50 text-blue-950"
                : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50",
            )}
            onClick={() => setJenis("MANDIRI")}
          >
            <span className="font-semibold block">Mandiri</span>
            <span className="text-[11px] text-gray-600 mt-0.5 block leading-snug">
              Tanpa penilaian OPD tingkat pengajuan; penilaian dilakukan per
              dokumen SOP.
            </span>
          </button>
        </div>
      </fieldset>
    </FormDialog>
  );
}
