/**
 * useDetailSopPenyusun hook
 * Manages ALL state for the SOP penyusun editor including:
 * - Loading data from API (sopDetail, langkahList)
 * - Persisting changes to API (metadata, langkah, status)
 * - UI state management (tabs, collapse states, etc.)
 * - Business logic (save draft, complete, etc.)
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/utils/toast";
import { usePeraturan } from "@/features/organisasi";
import { usePelaksana } from "@/features/sop";
import { useDetailSopById, useLangkahSop, useUpdateMetadata, useEditHistory } from "@/features/sop/hooks/useDetailSop";
import { useSopStatus } from "@/features/sop/hooks/useSopStatus";
import {
  transformSopDetailToMetadata,
  transformLangkahToProsedurRow,
  transformProsedurRowToCreateLangkah,
  transformProsedurRowToUpdateLangkah,
  isTempId,
} from "@/features/sop/hooks/useDetailSop";
import type { NavigateOptions } from "@tanstack/react-router";
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
  prosedurRows: ProsedurRow[];
  setProsedurRows: React.Dispatch<React.SetStateAction<ProsedurRow[]>>;
  implementers: { id: string; name: string }[];
  setImplementers: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>;
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
  setRightPanelTab: React.Dispatch<React.SetStateAction<"edit" | "komentar" | "aktivitas">>;
  komentarDisplay: KomentarDisplayItem[];

  // Loading states
  isLoading: boolean;

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
  handleSaveDraft: (id: string | undefined, role: string | null) => Promise<void>;
  handleComplete: (
    id: string | undefined,
    role: string | null,
    navigate: (opts: NavigateOptions) => void,
  ) => Promise<void>;
}

export function useDetailSopPenyusun(
  sopDetailId: string | undefined,
  sopStatusOverride: StatusSOP | undefined,
  _isRevisionFlowOverride?: boolean,
): UseDetailSopPenyusunReturn {
  const { showToast } = useToast();
  const { setSopStatusOverrideAsync, isUpdating } = useSopStatus();
  const { list: peraturanList } = usePeraturan();
  const { list: pelaksanaList } = usePelaksana();

  // Fetch data from API
  const { data: sopDetail, isLoading: isLoadingDetail } = useDetailSopById(sopDetailId ?? "");
  const { list: langkahList, isLoading: isLoadingLangkah, create: createLangkah, update: updateLangkah } = useLangkahSop(sopDetailId ?? "");
  const { data: auditLogs = [] } = useEditHistory(sopDetailId ?? "");
  const updateMetadataMutation = useUpdateMetadata();

  // State
  const [metadata, setMetadata] = useState<SOPDetailMetadata>({});
  const [prosedurRows, setProsedurRows] = useState<ProsedurRow[]>([]);
  const [implementers, setImplementers] = useState<{ id: string; name: string }[]>([]);

  // UI State
  const [diagramVersion, setDiagramVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<"flowchart" | "bpmn">("flowchart");
  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const [isEditPanelCollapsed, setIsEditPanelCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"edit" | "komentar" | "aktivitas">("edit");

  // Initialize metadata from API data
  useEffect(() => {
    if (sopDetail) {
      setMetadata(transformSopDetailToMetadata(sopDetail));
    }
  }, [sopDetail]);

  // Initialize prosedurRows from API data
  useEffect(() => {
    if (langkahList && langkahList.length > 0) {
      const rows = langkahList
        .sort((a, b) => a.urutan - b.urutan)
        .map(transformLangkahToProsedurRow);
      setProsedurRows(rows);

      // Seed implementers from loaded steps
      const implementerIds = new Set(rows.map(r => r.pelaksana).filter(Boolean));
      const impls = Array.from(implementerIds).map(id => {
        const p = pelaksanaList.find(x => x.id === id);
        return { id, name: p?.namaPelaksana ?? id };
      });
      setImplementers(impls);
    } else if (langkahList && langkahList.length === 0) {
      setProsedurRows([]);
    }
  }, [langkahList, pelaksanaList]);

  // Komentar display
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

  // Current SOP status
  const currentSopStatus: StatusSOP = (sopStatusOverride ?? DEFAULT_SOP_STATUS) as StatusSOP;
  const isRevisionFlow = currentSopStatus === "REVISI_DARI_TIM_EVALUASI";
  const primaryActionLabel = isRevisionFlow ? "Selesaikan revisi" : "Selesai";
  const isLoading = isLoadingDetail || isLoadingLangkah;

  // Handlers
  const handleMetadataChange = useCallback(
    <K extends keyof SOPDetailMetadata>(field: K, value: SOPDetailMetadata[K]) => {
      setMetadata((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  /** Save all changes (metadata + langkah) to server, then update status */
  const persistAllChanges = useCallback(async (sopDetailId: string) => {
    // 1. Save metadata
    await updateMetadataMutation.mutateAsync({
      id: sopDetailId,
      payload: {
        logoInstansi: metadata.logoUrl,
        namaLembaga: metadata.lembaga,
        tanggalEfektif: metadata.tanggalEfektif || undefined,
        tanggalRevisi: metadata.tanggalRevisi || undefined,
      },
    });

    // 2. Sync langkah: create new ones, update existing ones, delete removed ones
    const existingIds = new Set(langkahList?.map(l => l.id) ?? []);
    const currentIds = new Set(prosedurRows.map(r => r.id).filter(id => !isTempId(id)));

    // Create new langkah
    for (const row of prosedurRows) {
      if (isTempId(row.id)) {
        const dto = transformProsedurRowToCreateLangkah(row, sopDetailId);
        if (dto.kegiatan && dto.pelaksanaId) {
          try {
            await createLangkah(dto);
          } catch (error) {
            console.error("Failed to create langkah:", error);
            throw error;
          }
        }
      }
    }

    // Update existing langkah
    for (const row of prosedurRows) {
      if (!isTempId(row.id) && existingIds.has(row.id)) {
        const dto = transformProsedurRowToUpdateLangkah(row);
        try {
          await updateLangkah({ id: row.id, payload: dto });
        } catch (error) {
          console.error("Failed to update langkah:", error);
          throw error;
        }
      }
    }

    // Delete removed langkah
    for (const existingId of existingIds) {
      if (!currentIds.has(existingId)) {
        try {
          await sopApi.deleteLangkah(sopDetailId, existingId);
        } catch (error) {
          console.error("Failed to delete langkah:", error);
          throw error;
        }
      }
    }
  }, [metadata, prosedurRows, langkahList, updateMetadataMutation, createLangkah, updateLangkah]);

  const handleSaveDraft = useCallback(
    async (id: string | undefined, role: string | null) => {
      if (!id || !role) {
        showToast("ID SOP tidak tersedia", "error");
        return;
      }

      try {
        await persistAllChanges(id);
        await setSopStatusOverrideAsync(id, "SEDANG_DISUSUN");
        showToast("Draft berhasil disimpan, status diubah menjadi Sedang Disusun");
      } catch (error) {
        console.error("Failed to save draft:", error);
        showToast("Gagal menyimpan draft. Periksa data yang diisi.", "error");
      }
    },
    [persistAllChanges, setSopStatusOverrideAsync, showToast],
  );

  const handleComplete = useCallback(
    async (
      id: string | undefined,
      role: string | null,
      navigateFn?: (opts: NavigateOptions) => void,
    ) => {
      if (!id || !role) {
        showToast("ID SOP tidak tersedia", "error");
        return;
      }

      try {
        await persistAllChanges(id);
        await setSopStatusOverrideAsync(id, "SIAP_DIEVALUASI");
        showToast(
          isRevisionFlow
            ? "Revisi selesai. Kembali ke Manajemen SOP untuk kirim ulang ke evaluasi."
            : "SOP berhasil disimpan dan siap diajukan ke evaluasi.",
        );
        if (navigateFn) {
          navigateFn({ to: ROUTES.TIM_PENYUSUN.SOP });
        }
      } catch (error) {
        console.error("Failed to complete SOP:", error);
        showToast("Gagal menyelesaikan SOP. Periksa data yang diisi.", "error");
      }
    },
    [persistAllChanges, setSopStatusOverrideAsync, showToast, isRevisionFlow],
  );

  return {
    // State
    metadata,
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

    // Loading states
    isLoading,

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
