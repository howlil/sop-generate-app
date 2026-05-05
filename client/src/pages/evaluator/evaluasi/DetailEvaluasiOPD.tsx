/**
 * Workspace evaluasi SOP per OPD.
 * Dari list OPD, klik OPD → langsung ke workspace ini: daftar SOP (kiri), preview (tengah), form evaluasi (kanan).
 */
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearch } from "@tanstack/react-router";
import { Send, List, Printer } from "lucide-react";
import { SOPPreviewTemplate } from "@/pages/penyusun/sop/components/SOPPreviewTemplate";
import { SOPListCard } from "@/pages/penyusun/sop/components/SOPListCard";
import { Button } from "@/components/ui/button";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { CollapsibleSidePanel } from "@/components/ui/collapsible-side-panel";
import {
  useEvaluasiDraft,
  useEvaluasiSubmit,
  useEvaluasiWorkspaceOpd,
  usePengajuanEvaluasiAktif,
  buildAjukanEvaluasiSnapshotRows,
  getAjukanEvaluasiBlockingReason,
} from "@/api/evaluasi";
import { ROUTES } from "@/utils/constants";
import { ApiError } from "@/lib/api/api-client";
import { mapPenyusunWorkbenchToPreviewProps } from "@/lib/sop/detailSop.mappers";
import { useCollapsiblePanels } from "@/hooks/useCollapsiblePanels";
import { useAppRole } from "@/hooks/useAppRole";
import { formatDateId } from "@/utils/format-date";
import type {
  EvaluasiWorkspaceTampilanAlur,
  EvaluasiWorkspacePengajuanAktif,
  StatusHasilEvaluasi,
  EvaluasiBatchSubmitError,
} from "@/types/dto/evaluasi.dto";

import { DetailEvaluasiOPDSubmitDialog } from "./components/DetailEvaluasiOPDSubmitDialog";
import { DetailEvaluasiOPDFormPanel } from "./components/DetailEvaluasiOPDFormPanel";
import type { DetailEvaluasiActiveTab } from "./components/DetailEvaluasiOPDFormPanel";
import { useDocumentTitle } from "@/hooks/use-document-title";

const POST_SUBMIT_DELAY_MS = 1500;

function alurToDisplayLabel(
  alur: EvaluasiWorkspaceTampilanAlur,
): "Diajukan Evaluasi" | "Sedang Dievaluasi" | "Selesai Evaluasi" {
  switch (alur) {
    case "perlu_evaluasi":
      return "Diajukan Evaluasi";
    case "sedang_dievaluasi":
      return "Sedang Dievaluasi";
    case "selesai_pengajuan_ini":
      return "Selesai Evaluasi";
  }
}

export function DetailEvaluasiOPD() {
  const { id: opdId } = useParams({ from: "/evaluator/evaluasi/$id" });
  const { sopId: preferredSopId } = useSearch({
    from: "/evaluator/evaluasi/$id",
  });
  const navigate = useNavigate();
  const { getRoleUserName } = useAppRole();

  const [selectedSopId, setSelectedSopId] = useState<string | null>(
    preferredSopId ?? null,
  );
  const preferredSopAppliedRef = useRef(false);

  interface EvaluasiRecord {
    evaluatorName: string;
    date: string;
  }
  type EvaluasiRecordMap = Record<string, EvaluasiRecord>;
  const [lastEvaluatedBy, setLastEvaluatedBy] = useState<EvaluasiRecordMap>({});

  const workspaceQueryParams = useMemo(
    () => ({
      detailSopId: selectedSopId ?? undefined,
      expand: selectedSopId ? ("preview" as const) : undefined,
      riwayatLimit: 30,
    }),
    [selectedSopId],
  );

  const {
    data: workspace,
    isLoading: isLoadingWorkspace,
    error: workspaceError,
  } = useEvaluasiWorkspaceOpd(opdId, workspaceQueryParams);

  const pengajuanFallbackState = usePengajuanEvaluasiAktif(
    opdId,
    workspace === undefined ? undefined : workspace.pengajuanAktif,
  );

  /** Gabungan workspace + GET /evaluasi bila server mengembalikan pengajuan null (mis. ketidakkonsistenan cache). */
  const pengajuanAktifEffektif = useMemo(():
    | EvaluasiWorkspacePengajuanAktif
    | null
    | undefined => {
    if (workspace === undefined) {
      return undefined;
    }
    if (workspace.pengajuanAktif !== null) {
      return workspace.pengajuanAktif;
    }
    const fp = pengajuanFallbackState.pengajuan;
    if (fp === null) {
      return null;
    }
    return {
      id: fp.id,
      status: fp.status,
      nilaiPerDetail: fp.nilaiEvaluasi.map((n) => ({
        detailSopId: n.sopDetailId,
        hasil: (n.hasil ?? null) as StatusHasilEvaluasi | null,
        catatan: n.catatan ?? null,
        version: n.version,
      })),
    };
  }, [workspace, pengajuanFallbackState.pengajuan]);

  const opd = useMemo(() => {
    if (!workspace) return null;
    return {
      id: workspace.opd.id,
      nama: workspace.opd.nama,
      kode: workspace.opd.id,
    };
  }, [workspace]);

  /** Satu baris per DetailSOP dalam pipeline evaluasi (server). */
  const sopsForOpd = useMemo(() => {
    if (!workspace) return [];
    return workspace.daftarSop.map((row) => ({
      id: row.detailSopId,
      judul: row.judul,
      nomorSOP: row.nomorSOP,
      status: row.statusDetail,
      alur: row.tampilanAlur,
    }));
  }, [workspace]);

  /** Status tampilan untuk filter/badge: server `tampilanAlur` + override lokal setelah kirim. */
  const sopsForOpdWithDisplayStatus = useMemo(
    () =>
      sopsForOpd.map((s) => ({
        ...s,
        displayStatus: lastEvaluatedBy[s.id]
          ? ("Selesai Evaluasi" as const)
          : alurToDisplayLabel(s.alur),
      })),
    [sopsForOpd, lastEvaluatedBy],
  );

  const firstSopId = sopsForOpdWithDisplayStatus[0]?.id ?? null;

  useEffect(() => {
    if (!workspace?.daftarSop.length) return;
    if (selectedSopId !== null) return;
    setSelectedSopId(workspace.daftarSop[0].detailSopId);
  }, [workspace, selectedSopId]);

  const effectiveSopId = selectedSopId ?? firstSopId;
  const selectedSop = sopsForOpd.find((s) => s.id === effectiveSopId);

  /* Terapkan sopId dari URL search sekali saat daftar SOP siap (bukan fetch). */
  useEffect(() => {
    if (preferredSopAppliedRef.current) return;
    if (!preferredSopId) return;
    if (!sopsForOpd.some((s) => s.id === preferredSopId)) return;
    setSelectedSopId(preferredSopId);
    preferredSopAppliedRef.current = true;
  }, [preferredSopId, sopsForOpd]);

  /* Jaga selectedSopId konsisten saat daftar SOP berubah (bukan fetch). */
  useEffect(() => {
    const stillInList = sopsForOpdWithDisplayStatus.some(
      (s) => s.id === effectiveSopId,
    );
    if (!stillInList && sopsForOpdWithDisplayStatus.length > 0) {
      setSelectedSopId(sopsForOpdWithDisplayStatus[0].id);
    } else if (!stillInList) {
      setSelectedSopId(null);
    }
  }, [sopsForOpdWithDisplayStatus, effectiveSopId]);

  const {
    komentarEvaluasi,
    setKomentarEvaluasi,
    statusEvaluasi,
    setStatusEvaluasi,
    saveDraft,
  } = useEvaluasiDraft(
    opdId,
    effectiveSopId ?? undefined,
    workspace === undefined ? undefined : pengajuanAktifEffektif,
  );

  const handleSelectSop = useCallback(
    (id: string | null) => {
      saveDraft();
      setSelectedSopId(id);
    },
    [saveDraft],
  );

  /** Ubah status evaluasi. */
  const handleSetStatusEvaluasi = useCallback(
    (status: StatusHasilEvaluasi | null) => {
      setStatusEvaluasi(status);
    },
    [setStatusEvaluasi],
  );

  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] =
    useState<DetailEvaluasiActiveTab>("sop");
  const [ratingOPD, setRatingOPD] = useState<number | null>(null);

  const judulByDetailId = useMemo(() => {
    const m = new Map<string, { judul: string; nomorSOP: string }>();
    for (const row of workspace?.daftarSop ?? []) {
      m.set(row.detailSopId, { judul: row.judul, nomorSOP: row.nomorSOP });
    }
    return m;
  }, [workspace?.daftarSop]);

  const blockingAjukan = useMemo(
    () =>
      getAjukanEvaluasiBlockingReason(
        pengajuanAktifEffektif,
        ratingOPD,
        effectiveSopId,
        statusEvaluasi,
      ),
    [
      pengajuanAktifEffektif,
      ratingOPD,
      effectiveSopId,
      statusEvaluasi,
    ],
  );

  const canAjukan = blockingAjukan === null;

  const ajukanSnapshotRows = useMemo(
    () =>
      buildAjukanEvaluasiSnapshotRows(
        pengajuanAktifEffektif ?? null,
        judulByDetailId,
        effectiveSopId,
        statusEvaluasi,
      ),
    [
      pengajuanAktifEffektif,
      judulByDetailId,
      effectiveSopId,
      statusEvaluasi,
    ],
  );

  const detailIdsInPengajuan = useMemo(
    () =>
      pengajuanAktifEffektif?.nilaiPerDetail.map((r) => r.detailSopId) ??
      [],
    [pengajuanAktifEffektif],
  );

  const namaEvaluator = getRoleUserName();

  const lastEvaluatedEntry = effectiveSopId
    ? lastEvaluatedBy[effectiveSopId]
    : undefined;
  const tanggalTerakhirEvaluasi = lastEvaluatedEntry
    ? lastEvaluatedEntry.date
    : null;
  /** Evaluator yang terakhir mengevaluasi SOP terpilih (per SOP bisa beda) */
  const evaluatorSopTerpilih = lastEvaluatedEntry?.evaluatorName ?? null;

  const {
    leftCollapsed: leftPanelCollapsed,
    setLeftCollapsed: setLeftPanelCollapsed,
    rightCollapsed: rightPanelCollapsed,
    setRightCollapsed: setRightPanelCollapsed,
  } = useCollapsiblePanels();

  const {
    handleSubmitAll,
    terjadwalSubmitError,
    clearTerjadwalSubmitError,
    isSubmitting: isAjukanSubmitting,
  } = useEvaluasiSubmit({
    pengajuanAktifId: pengajuanAktifEffektif?.id,
    ratingOPD,
    detailIdsInPengajuan,
    canSubmit: canAjukan,
    blockingMessage: blockingAjukan,
    namaEvaluator,
    setLastEvaluatedBy,
    onSuccess: () => {
      setIsSubmitOpen(false);
      setTimeout(
        () => navigate({ to: ROUTES.EVALUATOR.EVALUASI }),
        POST_SUBMIT_DELAY_MS,
      );
    },
  });

  useDocumentTitle(opd ? `Evaluasi SOP — ${opd.nama}` : undefined);

  const riwayatSop = useMemo(() => {
    if (!workspace?.riwayatNilaiSopTerpilih?.length) return [];
    return workspace.riwayatNilaiSopTerpilih.map((r) => ({
      tanggal: r.tanggal,
      evaluator: r.evaluatorNama,
      hasil: r.hasil,
      catatan: r.catatan ?? "",
    }));
  }, [workspace]);

  const riwayatOpd = useMemo(() => {
    if (!workspace?.riwayatOpd?.length) return [];
    return workspace.riwayatOpd.map((r) => ({
      tanggal: r.tanggal,
      evaluator: r.evaluatorNama,
      catatan: r.catatan ?? "",
      nilaiOPD: r.nilaiOPD ?? undefined,
    }));
  }, [workspace]);

  const previewProps = useMemo(() => {
    if (!workspace?.preview?.workbench) return null;
    try {
      return mapPenyusunWorkbenchToPreviewProps(workspace.preview.workbench);
    } catch {
      return null;
    }
  }, [workspace]);

  const opdNotFound =
    workspaceError instanceof ApiError && workspaceError.status === 404;

  /** Convert string error to EvaluasiBatchSubmitError shape */
  const submitErrorObj = useMemo((): EvaluasiBatchSubmitError => {
    if (!terjadwalSubmitError) return { kind: "none", items: [] };
    return {
      kind: "blocked",
      items: [],
      message: terjadwalSubmitError,
    };
  }, [terjadwalSubmitError]);

  if (isLoadingWorkspace && !workspace) {
    return (
      <DetailPageLayout
        breadcrumb={[
          { label: "Evaluasi SOP", to: ROUTES.EVALUATOR.EVALUASI },
        ]}
        title="Evaluasi SOP"
        description=""
        backTo={ROUTES.EVALUATOR.EVALUASI}
        main={
          <p className="p-4 text-sm text-gray-600">Memuat workspace evaluasi…</p>
        }
      />
    );
  }

  if (workspaceError && !opdNotFound) {
    return (
      <DetailPageLayout
        breadcrumb={[
          { label: "Evaluasi SOP", to: ROUTES.EVALUATOR.EVALUASI },
        ]}
        title="Evaluasi SOP"
        description=""
        backTo={ROUTES.EVALUATOR.EVALUASI}
        main={
          <p className="p-4 text-sm text-red-600">
            {workspaceError instanceof Error
              ? workspaceError.message
              : "Gagal memuat workspace evaluasi."}
          </p>
        }
      />
    );
  }

  if (opdNotFound || (!opd && !isLoadingWorkspace)) {
    return (
      <DetailPageLayout
        breadcrumb={[
          { label: "Evaluasi SOP", to: ROUTES.EVALUATOR.EVALUASI },
        ]}
        title="Evaluasi SOP"
        description=""
        backTo={ROUTES.EVALUATOR.EVALUASI}
        main={<p className="p-4 text-sm text-gray-600">OPD tidak ditemukan.</p>}
      />
    );
  }

  if (!opd) {
    return (
      <DetailPageLayout
        breadcrumb={[
          { label: "Evaluasi SOP", to: ROUTES.EVALUATOR.EVALUASI },
        ]}
        title="Evaluasi SOP"
        description=""
        backTo={ROUTES.EVALUATOR.EVALUASI}
        main={
          <p className="p-4 text-sm text-gray-600">Memuat data OPD…</p>
        }
      />
    );
  }

  /** Sedang Dievaluasi = SOP terpilih yang punya isian form (draft). Selesai Evaluasi tetap dikunci. */
  const listItems = sopsForOpdWithDisplayStatus.map((s) => {
    const isSelectedWithDraft =
      s.id === effectiveSopId &&
      (statusEvaluasi != null || (komentarEvaluasi?.trim() ?? "") !== "");
    const displayStatus =
      s.displayStatus === "Selesai Evaluasi"
        ? "Selesai Evaluasi"
        : isSelectedWithDraft
          ? "Sedang Dievaluasi"
          : s.displayStatus;
    return {
      id: s.id,
      nama: s.judul,
      nomor: s.nomorSOP,
      status: displayStatus,
    };
  });

  return (
    <>
      {pengajuanAktifEffektif && ajukanSnapshotRows.length > 0 && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50/95 px-3 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-blue-950">
          <span>
            {canAjukan ? (
              <>
                Semua dokumen <strong>Sesuai</strong> dan skor OPD terisi — siap{" "}
                <strong>Kirim Hasil Evaluasi</strong> ke PJ Evaluator.
              </>
            ) : (
              <>{blockingAjukan}</>
            )}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 shrink-0 border-blue-300 text-blue-900"
            onClick={() => {
              clearTerjadwalSubmitError();
              setIsSubmitOpen(true);
            }}
          >
            Buka dialog ajukan
          </Button>
        </div>
      )}
      <DetailPageLayout
        breadcrumb={[
          { label: "Evaluasi SOP", to: ROUTES.EVALUATOR.EVALUASI },
          { label: opd.nama },
        ]}
        title={`Evaluasi SOP — ${opd.nama}`}
        description="Pilih SOP di daftar kiri, isi form evaluasi di panel kanan."
        backTo={ROUTES.EVALUATOR.EVALUASI}
        backSize="icon"
        header={
          <>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Workspace Evaluasi SOP
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50"
                  onClick={() => window.print()}
                >
                  <Printer className="w-3.5 h-3.5" /> Print SOP
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs gap-1.5 disabled:opacity-50"
                  onClick={() => {
                    clearTerjadwalSubmitError();
                    setIsSubmitOpen(true);
                  }}
                >
                  <Send className="w-3.5 h-3.5" /> Kirim Hasil Evaluasi
                </Button>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-gray-700">
              <span>
                <span className="text-gray-500">Evaluator (SOP ini):</span>{" "}
                <span className="font-medium">
                  {evaluatorSopTerpilih ?? "—"}
                </span>
              </span>
              <span>
                <span className="text-gray-500">Terakhir evaluasi:</span>{" "}
                {tanggalTerakhirEvaluasi
                  ? formatDateId(tanggalTerakhirEvaluasi)
                  : "—"}
              </span>
            </div>
          </>
        }
        leftPanel={
          <CollapsibleSidePanel
            side="left"
            collapsed={leftPanelCollapsed}
            onCollapsedChange={setLeftPanelCollapsed}
            widthExpanded="w-full"
            title="Daftar SOP"
            subtitle={`${listItems.length} dokumen`}
            collapseButtonLabel="Daftar"
            collapseButtonIcon={<List className="w-5 h-5" />}
          >
            <div className="flex flex-col h-full min-h-0">
              <div className="flex-1 min-h-0 overflow-auto scrollbar-hide">
                <SOPListCard
                  items={listItems}
                  selectedId={effectiveSopId}
                  onSelect={handleSelectSop}
                  variant="compact"
                />
              </div>
            </div>
          </CollapsibleSidePanel>
        }
        main={
          <div className="flex flex-col h-full">
            <div className="p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h3 className="text-xs font-semibold text-gray-700">
                Preview SOP
              </h3>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              {selectedSop ? (
                previewProps ? (
                  <SOPPreviewTemplate
                    metadata={previewProps.metadata}
                    prosedurRows={previewProps.prosedurRows}
                    implementers={previewProps.implementers}
                    name={previewProps.name}
                    number={previewProps.number}
                  />
                ) : (
                  <SOPPreviewTemplate
                    name={selectedSop.judul}
                    number={selectedSop.nomorSOP}
                  />
                )
              ) : (
                <div className="flex items-center justify-center flex-1 text-xs text-gray-400">
                  Pilih SOP di daftar kiri
                </div>
              )}
            </div>
          </div>
        }
        rightPanel={
          <DetailEvaluasiOPDFormPanel
            panelState={{
              collapsed: rightPanelCollapsed,
              onCollapsedChange: setRightPanelCollapsed,
              activeFormTab,
              onTabChange: setActiveFormTab,
            }}
            sopForm={{
              effectiveSopId,
              lastEvaluatedBy,
              statusEvaluasi,
              setStatusEvaluasi: handleSetStatusEvaluasi,
              komentarEvaluasi: komentarEvaluasi ?? "",
              setKomentarEvaluasi,
              riwayatSop,
            }}
            opdForm={{
              opd,
              riwayatOpd,
              ratingOPD,
              setRatingOPD,
            }}
          />
        }
      />

      <DetailEvaluasiOPDSubmitDialog
        open={isSubmitOpen}
        onOpenChange={(open) => {
          setIsSubmitOpen(open);
          if (!open) clearTerjadwalSubmitError();
        }}
        snapshotRows={ajukanSnapshotRows}
        canConfirm={canAjukan}
        blockingReason={blockingAjukan}
        onConfirm={() => void handleSubmitAll()}
        isSubmitting={isAjukanSubmitting}
        terjadwalSubmitError={submitErrorObj}
      />
    </>
  );
}
