/**
 * Workspace evaluasi SOP per OPD.
 * Dari list OPD, klik OPD → langsung ke workspace ini: daftar SOP (kiri), preview (tengah), form evaluasi (kanan).
 */
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearch } from "@tanstack/react-router";
import { Send, List, Printer } from "lucide-react";
import { SOPPreviewTemplate } from "@/features/sop/components/SOPPreviewTemplate";
import { SOPListCard } from "@/features/sop";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { CollapsibleSidePanel } from "@/components/ui/collapsible-side-panel";
import {
  useEvaluasiDraft,
  useEvaluasiSopByOpd,
  useRiwayatEvaluasiSop,
  useRiwayatEvaluasiOpd,
} from "@/features/evaluasi";
import { useEvaluasiSubmit } from "@/features/evaluasi";
import { EVALUASI_DISPLAY_STATUS_OPTIONS } from "@/utils/constants";
import { ROUTES } from "@/utils/constants";
import { useCollapsiblePanels } from "@/hooks/useCollapsiblePanels";
import { useAppRole } from "@/features/auth";
import { formatDateId } from "@/utils/format-date";
import type { NilaiEvaluasi, PengajuanEvaluasi } from "@/features/evaluasi";
import type { StatusHasilEvaluasi } from "@/types/common";
import type { RiwayatEvaluasiEntry } from "@/features/evaluasi";
import type { EvaluasiBatchSubmitError } from "@/features/evaluasi/hooks/useEvaluasiSubmit";

// Legacy data transform helpers (now backed by API hooks)
function transformRiwayatToLegacy(
  entries: RiwayatEvaluasiEntry[],
): NilaiEvaluasi[] {
  return entries.map((e) => ({
    id: `${e.tanggal}-${e.evaluator}`,
    pengajuanEvaluasiId: "",
    sopDetailId: "",
    hasil: e.hasil as StatusHasilEvaluasi | undefined,
    catatan: e.catatan,
    version: 0,
    createdAt: e.tanggal,
    updatedAt: e.tanggal,
  }));
}

import { DetailEvaluasiOPDSubmitDialog } from "../components/DetailEvaluasiOPDSubmitDialog";
import { DetailEvaluasiOPDFormPanel } from "../components/DetailEvaluasiOPDFormPanel";
import { useDocumentTitle } from "@/hooks/use-document-title";

const POST_SUBMIT_DELAY_MS = 1500;

export function DetailEvaluasiOPD() {
  const { opdId } = useParams({ from: "/tim-evaluasi/penilaian/$opdId" });
  const { sopId: preferredSopId } = useSearch({
    from: "/tim-evaluasi/penilaian/$opdId",
  });
  const navigate = useNavigate();
  const { getRoleUserName } = useAppRole();

  const { sopList: sopListFromApi } = useEvaluasiSopByOpd(opdId);
  const { data: riwayatOpdRaw } = useRiwayatEvaluasiOpd(opdId);
  const riwayatEvaluasiOpd = useMemo(
    () => transformRiwayatToLegacy(riwayatOpdRaw ?? []),
    [riwayatOpdRaw],
  );

  const sopList = useMemo(() => sopListFromApi ?? [], [sopListFromApi]);

  /** All SOPs belonging to this OPD (by opdId), already filtered by API hook. */
  const sopsForOpd = useMemo(() => {
    return sopList.map((s) => ({
      id: s.id,
      judul: s.sop?.judul ?? s.namaLembaga,
      nomorSOP: s.nomorSOP,
      status: s.status,
    }));
  }, [sopList]);

  /** OPD name is derived from the first matching SOP's lembaga name or the opdId itself. */
  const opd = useMemo(() => {
    const firstSop = sopList[0];
    if (!firstSop) return null;
    return {
      id: opdId,
      nama: firstSop.namaLembaga ?? opdId,
      kode: opdId,
    };
  }, [sopList, opdId]);

  // Track evaluated SOPs in local state (auto-save handled by useEvaluasiDraft hook)
  interface EvaluasiRecord {
    evaluatorName: string;
    date: string;
  }
  type EvaluasiRecordMap = Record<string, EvaluasiRecord>;
  const [lastEvaluatedBy, setLastEvaluatedBy] = useState<EvaluasiRecordMap>({});

  /** Di workspace evaluasi: Diajukan Evaluasi (belum dikirim), Selesai Evaluasi (sudah dikirim hasil). */
  const sopsForOpdWithDisplayStatus = useMemo(
    () =>
      sopsForOpd.map((s) => ({
        ...s,
        displayStatus: lastEvaluatedBy[s.id]
          ? ("Selesai Evaluasi" as const)
          : ("Diajukan Evaluasi" as const),
      })),
    [sopsForOpd, lastEvaluatedBy],
  );

  const [filterStatusLeft, setFilterStatusLeft] = useState("all" as string);
  const sopsFilteredByStatus = useMemo(() => {
    if (filterStatusLeft === "all") return sopsForOpdWithDisplayStatus;
    return sopsForOpdWithDisplayStatus.filter(
      (s) => s.displayStatus === filterStatusLeft,
    );
  }, [sopsForOpdWithDisplayStatus, filterStatusLeft]);

  const [filterEvaluator, setFilterEvaluator] = useState("all" as string);
  const uniqueEvaluatorNames = useMemo(() => {
    const names = new Set(
      Object.values(lastEvaluatedBy).map((v) => v.evaluatorName),
    );
    return Array.from(names).sort();
  }, [lastEvaluatedBy]);
  const evaluatorFilterOptions = useMemo(
    () => [
      { value: "all", label: "Semua evaluator" },
      ...uniqueEvaluatorNames.map((n) => ({ value: n, label: n })),
    ],
    [uniqueEvaluatorNames],
  );

  const sopsFilteredByStatusAndEvaluator = useMemo(() => {
    if (filterEvaluator === "all") return sopsFilteredByStatus;
    return sopsFilteredByStatus.filter(
      (s) => lastEvaluatedBy[s.id]?.evaluatorName === filterEvaluator,
    );
  }, [sopsFilteredByStatus, filterEvaluator, lastEvaluatedBy]);

  const firstSopId = sopsFilteredByStatusAndEvaluator[0]?.id ?? null;
  const [selectedSopId, setSelectedSopId] = useState<string | null>(
    preferredSopId ?? null,
  );
  const preferredSopAppliedRef = useRef(false);
  const effectiveSopId = selectedSopId ?? firstSopId;
  const selectedSop = sopsForOpd.find((s) => s.id === effectiveSopId);

  useEffect(() => {
    if (preferredSopAppliedRef.current) return;
    if (!preferredSopId) return;
    if (!sopsForOpd.some((s) => s.id === preferredSopId)) return;
    setSelectedSopId(preferredSopId);
    preferredSopAppliedRef.current = true;
  }, [preferredSopId, sopsForOpd]);

  useEffect(() => {
    const stillInList = sopsFilteredByStatusAndEvaluator.some(
      (s) => s.id === effectiveSopId,
    );
    if (!stillInList && sopsFilteredByStatusAndEvaluator.length > 0) {
      setSelectedSopId(sopsFilteredByStatusAndEvaluator[0].id);
    } else if (!stillInList) {
      setSelectedSopId(null);
    }
  }, [sopsFilteredByStatusAndEvaluator, effectiveSopId]);

  const {
    komentarEvaluasi,
    setKomentarEvaluasi,
    statusEvaluasi,
    setStatusEvaluasi,
  } = useEvaluasiDraft(opdId, effectiveSopId ?? undefined);

  /** Ubah status evaluasi. */
  const handleSetStatusEvaluasi = useCallback(
    (status: StatusHasilEvaluasi | null) => {
      setStatusEvaluasi(status);
    },
    [setStatusEvaluasi],
  );

  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<"sop" | "opd">("sop");
  const [ratingOPD, setRatingOPD] = useState<number | null>(null);

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

  /** Daftar SOP "Sedang Dievaluasi": SOP terpilih yang sudah isi status hasil. */
  const sedangDievaluasiList = useMemo(() => {
    const out: Array<{
      id: string;
      judul: string;
      nomorSOP: string;
      statusEvaluasi: StatusHasilEvaluasi;
      komentarEvaluasi: string;
    }> = [];
    for (const s of sopsFilteredByStatusAndEvaluator) {
      if (s.displayStatus === "Selesai Evaluasi") continue;
      if (s.id === effectiveSopId && statusEvaluasi != null) {
        out.push({
          id: s.id,
          judul: s.judul,
          nomorSOP: s.nomorSOP,
          statusEvaluasi,
          komentarEvaluasi: komentarEvaluasi?.trim() ?? "",
        });
      }
    }
    return out;
  }, [
    sopsFilteredByStatusAndEvaluator,
    effectiveSopId,
    statusEvaluasi,
    komentarEvaluasi,
  ]);

  const {
    submitSelectedIds,
    setSubmitSelectedIds,
    isSubmitCheckAll,
    isSubmitCheckAllIndeterminate,
    toggleSubmitSelected,
    setSubmitCheckAll,
    handleSubmitAll,
    terjadwalSubmitError,
    clearTerjadwalSubmitError,
  } = useEvaluasiSubmit({
    sedangDievaluasiList,
    namaEvaluator,
    ratingOPD,
    opdId: opd?.id,
    setLastEvaluatedBy,
    onSuccess: () => {
      setIsSubmitOpen(false);
      setTimeout(
        () => navigate({ to: ROUTES.TIM_EVALUASI.EVALUASI }),
        POST_SUBMIT_DELAY_MS,
      );
    },
  });

  useEffect(() => {
    if (isSubmitOpen && sedangDievaluasiList.length > 0) {
      setSubmitSelectedIds(new Set(sedangDievaluasiList.map((i) => i.id)));
    }
  }, [isSubmitOpen, sedangDievaluasiList, setSubmitSelectedIds]);

  useDocumentTitle(opd ? `Evaluasi SOP — ${opd.nama}` : undefined);

  /** Riwayat evaluasi SOP: use API hook. */
  const { data: riwayatSopRaw } = useRiwayatEvaluasiSop(effectiveSopId ?? "");
  const riwayatSop = useMemo(
    () => (effectiveSopId ? transformRiwayatToLegacy(riwayatSopRaw ?? []) : []),
    [effectiveSopId, riwayatSopRaw],
  );
  /** Riwayat evaluasi OPD: from API hook. */
  const riwayatOpd = useMemo(
    () => riwayatEvaluasiOpd as unknown as PengajuanEvaluasi[],
    [riwayatEvaluasiOpd],
  );

  /** Convert string error to EvaluasiBatchSubmitError shape */
  const submitErrorObj = useMemo((): EvaluasiBatchSubmitError => {
    if (!terjadwalSubmitError) return { kind: "none", items: [] };
    return { kind: "incomplete", items: [], message: terjadwalSubmitError };
  }, [terjadwalSubmitError]);

  if (!opd) {
    return (
      <DetailPageLayout
        breadcrumb={[
          { label: "Evaluasi SOP", to: ROUTES.TIM_EVALUASI.EVALUASI },
        ]}
        title="Evaluasi SOP"
        description=""
        backTo={ROUTES.TIM_EVALUASI.EVALUASI}
        main={<p className="p-4 text-sm text-gray-600">OPD tidak ditemukan.</p>}
      />
    );
  }

  /** Sedang Dievaluasi = SOP terpilih yang punya isian form (draft). Selesai Evaluasi tetap dikunci. */
  const listItems = sopsFilteredByStatusAndEvaluator.map((s) => {
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
      {sedangDievaluasiList.length > 0 && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50/95 px-3 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-blue-950">
          <span>
            <strong>{sedangDievaluasiList.length} SOP</strong> siap dikirim —
            gunakan <strong>Kirim Hasil Evaluasi</strong> untuk memilih dan
            mengirim hasil ke Tim Penyusun.
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
            Buka dialog kirim
          </Button>
        </div>
      )}
      <DetailPageLayout
        breadcrumb={[
          { label: "Evaluasi SOP", to: ROUTES.TIM_EVALUASI.EVALUASI },
          { label: opd.nama },
        ]}
        title={`Evaluasi SOP — ${opd.nama}`}
        description="Pilih SOP di daftar kiri, isi form evaluasi di panel kanan."
        backTo={ROUTES.TIM_EVALUASI.EVALUASI}
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
                  className="h-8 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs gap-1.5"
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
              <div className="p-2 border-b border-gray-100 flex flex-row flex-nowrap gap-1.5 flex-shrink-0">
                <Select
                  className="flex-1 min-w-0 h-8 text-xs"
                  value={filterStatusLeft}
                  onValueChange={setFilterStatusLeft}
                  options={[...EVALUASI_DISPLAY_STATUS_OPTIONS]}
                  aria-label="Filter by status"
                  title="Filter by status"
                />
                <Select
                  className="flex-1 min-w-0 h-8 text-xs"
                  value={filterEvaluator}
                  onValueChange={setFilterEvaluator}
                  options={evaluatorFilterOptions}
                  aria-label="Filter by evaluator"
                  title="Filter by evaluator"
                />
              </div>
              <div className="flex-1 min-h-0 overflow-auto scrollbar-hide">
                <SOPListCard
                  items={listItems}
                  selectedId={effectiveSopId}
                  onSelect={setSelectedSopId}
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
                <SOPPreviewTemplate
                  name={selectedSop.judul}
                  number={selectedSop.nomorSOP}
                />
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
            opd={opd}
            collapsed={rightPanelCollapsed}
            onCollapsedChange={setRightPanelCollapsed}
            activeFormTab={activeFormTab}
            onTabChange={setActiveFormTab}
            effectiveSopId={effectiveSopId}
            lastEvaluatedBy={lastEvaluatedBy}
            statusEvaluasi={statusEvaluasi}
            setStatusEvaluasi={handleSetStatusEvaluasi}
            komentarEvaluasi={komentarEvaluasi ?? ""}
            setKomentarEvaluasi={setKomentarEvaluasi}
            riwayatSop={riwayatSop}
            riwayatOpd={riwayatOpd}
            ratingOPD={ratingOPD}
            setRatingOPD={setRatingOPD}
          />
        }
      />

      <DetailEvaluasiOPDSubmitDialog
        open={isSubmitOpen}
        onOpenChange={(open) => {
          setIsSubmitOpen(open);
          if (!open) clearTerjadwalSubmitError();
        }}
        sedangDievaluasiList={sedangDievaluasiList}
        submitSelectedIds={submitSelectedIds}
        toggleSubmitSelected={toggleSubmitSelected}
        isSubmitCheckAll={isSubmitCheckAll}
        isSubmitCheckAllIndeterminate={isSubmitCheckAllIndeterminate}
        setSubmitCheckAll={setSubmitCheckAll}
        onConfirm={handleSubmitAll}
        terjadwalSubmitError={submitErrorObj}
      />
    </>
  );
}
