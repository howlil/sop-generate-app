/**
 * useDetailSopPenyusun hook
 * Extracted from DetailSOPPenyusun component for better separation of concerns
 *
 * NOTE: This is a "mega-hook" that manages ALL state for the SOP penyusun editor.
 * It mixes data state, UI state, computed values, and business logic.
 *
 * ARCHITECTURE NOTE: This hook does NOT use the granular mutation hooks from
 * `useDetailSop.ts` (like `useUpdateMetadata`, `useUpdateStatus`) because it
 * requires fine-grained control over status overrides and optimistic updates.
 * Consider unifying these approaches in a future refactor.
 *
 * RECOMMENDATION: Split into separate hooks for:
 * - Data management (use the granular hooks from useDetailSop.ts)
 * - UI state management (tabs, collapse states, etc.)
 * - Business logic (save draft, complete, etc.)
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useToast } from "@/utils/toast";
import { usePeraturan } from "@/features/organisasi";
import { usePelaksana, useEditHistory } from "@/features/sop";
import type { NavigateOptions } from "@tanstack/react-router";
import { useSopStatus } from "@/features/sop/hooks/useSopStatus";
import type { SOPDetailMetadata, ProsedurRow, StatusSOP } from "@/types/common";
import type { LogEditSOP } from "@/features/audit/types/audit";
import { DEFAULT_SOP_STATUS } from "@/features/sop/types/sop";
import type { Peraturan } from "@/features/organisasi";
import { ROUTES } from "@/utils/constants";

/** Display item for komentar/comments panel */
export interface KomentarDisplayItem {
  id: string;
  userName: string;
  role: string | undefined;
  text: string;
  timestamp: string;
}

export interface UseDetailSopPenyusunReturn {
  // State
  metadata: SOPDetailMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<SOPDetailMetadata>>;
  prosedurRows: ProsedurRow[];
  setProsedurRows: React.Dispatch<React.SetStateAction<ProsedurRow[]>>;
  implementers: { id: string; name: string }[];
  setImplementers: React.Dispatch<
    React.SetStateAction<{ id: string; name: string }[]>
  >;
  auditLogs: LogEditSOP[];

  // UI State
  diagramVersion: number;
  setDiagramVersion: React.Dispatch<React.SetStateAction<number>>;
  activeTab: "flowchart" | "bpmn";
  setActiveTab: React.Dispatch<React.SetStateAction<"flowchart" | "bpmn">>;
  isEditingSteps: boolean;
  setIsEditingSteps: React.Dispatch<React.SetStateAction<boolean>>;
  isEditPanelCollapsed: boolean;
  setIsEditPanelCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  rightPanelTab: "edit" | "komentar" | "aktivitas";
  setRightPanelTab: React.Dispatch<
    React.SetStateAction<"edit" | "komentar" | "aktivitas">
  >;
  komentarDisplay: KomentarDisplayItem[];

  // Computed
  masterPelaksanaOptions: { id: string; name: string }[];
  peraturanList: Peraturan[];
  currentSopStatus: StatusSOP;
  isRevisionFlow: boolean;
  primaryActionLabel: string;

  // Handlers
  handleMetadataChange: <K extends keyof SOPDetailMetadata>(
    field: K,
    value: SOPDetailMetadata[K],
  ) => void;
  handleSaveDraft: (id: string | undefined, role: string | null) => void;
  handleComplete: (
    id: string | undefined,
    role: string | null,
    navigate: (opts: NavigateOptions) => void,
  ) => void;
}

export function useDetailSopPenyusun(
  sopDetailId: string | undefined,
  sopStatusOverride: StatusSOP | undefined,
  isRevisionFlowOverride?: boolean,
): UseDetailSopPenyusunReturn {
  const { showToast } = useToast();
  const { setSopStatusOverride } = useSopStatus();
  const { list: peraturanList } = usePeraturan();
  const { list: pelaksanaList } = usePelaksana();
  const { data: auditLogs = [] } = useEditHistory(sopDetailId ?? "");

  // State
  const [metadata, setMetadata] = useState<SOPDetailMetadata>(() =>
    getInitialSopDetailMetadata(),
  );
  const [prosedurRows, setProsedurRows] = useState<ProsedurRow[]>(() => []);
  const [implementers, setImplementers] = useState<
    { id: string; name: string }[]
  >([]);
  const implementersSeededRef = useRef(false);

  // UI State
  const [diagramVersion, setDiagramVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<"flowchart" | "bpmn">("flowchart");
  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const [isEditPanelCollapsed, setIsEditPanelCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<
    "edit" | "komentar" | "aktivitas"
  >("edit");

  // Komentar display - uses audit logs as data source (GET /audit/detail-sop/:id)
  const komentarDisplay = useMemo(() => {
    return auditLogs.map((log) => ({
      id: log.id,
      userName: log.user?.nama ?? "Tidak diketahui",
      role: log.aktorRole ?? log.bagian,
      text: log.keterangan ?? "Tidak ada keterangan",
      timestamp: log.createdAt,
    }));
  }, [auditLogs]);

  // Master pelaksana options
  const masterPelaksanaOptions = useMemo(
    () =>
      pelaksanaList.map((p) => ({
        id: p.id,
        name: p.namaPelaksana,
      })),
    [pelaksanaList],
  );

  // Seed implementers from prosedurRows
  useEffect(() => {
    if (implementersSeededRef.current || pelaksanaList.length === 0) return;
    const ids = new Set(
      prosedurRows.flatMap((r) => Object.keys(r.pelaksanaMapping ?? {})),
    );
    if (ids.size === 0) return;
    implementersSeededRef.current = true;
    setImplementers(
      Array.from(ids).map((id) => {
        const p = pelaksanaList.find((x) => x.id === id);
        return { id, name: p?.namaPelaksana ?? id };
      }),
    );
  }, [pelaksanaList, prosedurRows]);

  // Current SOP status
  const currentSopStatus: StatusSOP = (sopStatusOverride ??
    DEFAULT_SOP_STATUS) as StatusSOP;

  const isRevisionFlow =
    isRevisionFlowOverride ?? currentSopStatus === "REVISI_DARI_TIM_EVALUASI";
  const primaryActionLabel = isRevisionFlow ? "Selesaikan revisi" : "Selesai";

  // Handlers
  const handleMetadataChange = useCallback(
    <K extends keyof SOPDetailMetadata>(
      field: K,
      value: SOPDetailMetadata[K],
    ) => {
      setMetadata((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSaveDraft = useCallback(
    (id: string | undefined, role: string | null) => {
      if (id && role) {
        setSopStatusOverride(id, "SEDANG_DISUSUN");
        showToast("Status diubah menjadi Sedang Disusun");
      }
    },
    [setSopStatusOverride, showToast],
  );

  const handleComplete = useCallback(
    (
      id: string | undefined,
      role: string | null,
      navigateFn?: (opts: NavigateOptions) => void,
    ) => {
      if (id && role) {
        setSopStatusOverride(id, "SIAP_DIEVALUASI");
        showToast(
          isRevisionFlow
            ? "Revisi selesai. Kembali ke Manajemen SOP untuk kirim ulang ke evaluasi."
            : "SOP selesai disusun. Ajukan ke evaluasi dari Manajemen SOP.",
        );
        if (navigateFn) {
          navigateFn({ to: ROUTES.TIM_PENYUSUN.SOP });
        }
      }
    },
    [setSopStatusOverride, showToast, isRevisionFlow],
  );

  return {
    // State
    metadata,
    setMetadata,
    prosedurRows,
    setProsedurRows,
    implementers,
    setImplementers,
    auditLogs,

    // UI State
    diagramVersion,
    setDiagramVersion,
    activeTab,
    setActiveTab,
    isEditingSteps,
    setIsEditingSteps,
    isEditPanelCollapsed,
    setIsEditPanelCollapsed,
    rightPanelTab,
    setRightPanelTab,
    komentarDisplay,

    // Computed
    masterPelaksanaOptions,
    peraturanList,
    currentSopStatus,
    isRevisionFlow,
    primaryActionLabel,

    // Handlers
    handleMetadataChange,
    handleSaveDraft,
    handleComplete,
  };
}
