import { useEffect, useMemo, useState } from "react";
import { usePeraturan } from "@/features/organisasi";
import { DEFAULT_SOP_STATUS } from "../types/sop";
import { usePelaksana } from "./usePelaksana";
import { useDetailSopById, useEditHistory, useLangkahSop, useUpdateMetadata } from "./useDetailSop";
import { useSopStatus } from "./useSopStatus";
import { transformLangkahToProsedurRow, transformSopDetailToMetadata } from "./detailSop.mappers";
import type { Peraturan } from "@/features/organisasi";
import type { LogEditSOP } from "@/features/audit/types/audit";
import type { ProsedurRow, SOPDetailMetadata, StatusSOP } from "@/types/common";

export interface KomentarDisplayItem {
  id: string;
  userName: string;
  role: string | undefined;
  text: string;
  timestamp: string;
}

export interface UseDetailSopPenyusunDataResult {
  metadata: SOPDetailMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<SOPDetailMetadata>>;
  prosedurRows: ProsedurRow[];
  setProsedurRows: React.Dispatch<React.SetStateAction<ProsedurRow[]>>;
  implementers: { id: string; name: string }[];
  setImplementers: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>;
  auditLogs: LogEditSOP[];
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
  isLoading: boolean;
  masterPelaksanaOptions: { id: string; name: string }[];
  peraturanList: Peraturan[];
  currentSopStatus: StatusSOP;
  isRevisionFlow: boolean;
  primaryActionLabel: string;
  langkahList: Array<{ id: string }>;
  createLangkah: (payload: import("../types/sop").CreateLangkahSOPDto) => Promise<unknown>;
  updateLangkah: (args: {
    id: string;
    payload: import("../types/sop").UpdateLangkahSOPDto;
  }) => Promise<unknown>;
  updateMetadataMutation: ReturnType<typeof useUpdateMetadata>;
  setSopStatusOverrideAsync: ReturnType<typeof useSopStatus>["setSopStatusOverrideAsync"];
}

export function useDetailSopPenyusunData(
  sopDetailId: string | undefined,
  sopStatusOverride: StatusSOP | undefined,
): UseDetailSopPenyusunDataResult {
  const { setSopStatusOverrideAsync } = useSopStatus();
  const { list: peraturanList } = usePeraturan();
  const { list: pelaksanaList } = usePelaksana();
  const { data: sopDetail, isLoading: isLoadingDetail } = useDetailSopById(sopDetailId ?? "");
  const {
    list: langkahList,
    isLoading: isLoadingLangkah,
    create: createLangkah,
    update: updateLangkah,
  } = useLangkahSop(sopDetailId ?? "");
  const { data: auditLogs = [] } = useEditHistory(sopDetailId ?? "");
  const updateMetadataMutation = useUpdateMetadata();

  const [metadata, setMetadata] = useState<SOPDetailMetadata>({});
  const [prosedurRows, setProsedurRows] = useState<ProsedurRow[]>([]);
  const [implementers, setImplementers] = useState<{ id: string; name: string }[]>([]);
  const [diagramVersion, setDiagramVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<"flowchart" | "bpmn">("flowchart");
  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const [isEditPanelCollapsed, setIsEditPanelCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"edit" | "komentar" | "aktivitas">("edit");

  useEffect(() => {
    if (sopDetail) {
      setMetadata(transformSopDetailToMetadata(sopDetail));
    }
  }, [sopDetail]);

  useEffect(() => {
    if (langkahList && langkahList.length > 0) {
      const rows = langkahList.sort((a, b) => a.urutan - b.urutan).map(transformLangkahToProsedurRow);
      setProsedurRows(rows);

      const implementerIds = new Set(rows.map((row) => row.pelaksana).filter(Boolean));
      const mappedImplementers = Array.from(implementerIds).map((id) => {
        const pelaksana = pelaksanaList.find((item) => item.id === id);
        return { id, name: pelaksana?.namaPelaksana ?? id };
      });
      setImplementers(mappedImplementers);
    } else if (langkahList && langkahList.length === 0) {
      setProsedurRows([]);
    }
  }, [langkahList, pelaksanaList]);

  const komentarDisplay = useMemo(
    () =>
      auditLogs.map((log) => ({
        id: log.id,
        userName: log.userId ?? "Tidak diketahui",
        role: log.aktorRole ?? log.bagian,
        text: log.keterangan ?? "Tidak ada keterangan",
        timestamp: log.createdAt,
      })),
    [auditLogs],
  );

  const masterPelaksanaOptions = useMemo(
    () =>
      pelaksanaList.map((pelaksana) => ({
        id: pelaksana.id,
        name: pelaksana.namaPelaksana,
      })),
    [pelaksanaList],
  );

  const currentSopStatus: StatusSOP = (sopStatusOverride ?? DEFAULT_SOP_STATUS) as StatusSOP;
  const isRevisionFlow = currentSopStatus === "REVISI_DARI_TIM_EVALUASI";
  const primaryActionLabel = isRevisionFlow ? "Selesaikan revisi" : "Selesai";
  const isLoading = isLoadingDetail || isLoadingLangkah;

  return {
    metadata,
    setMetadata,
    prosedurRows,
    setProsedurRows,
    implementers,
    setImplementers,
    auditLogs,
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
    isLoading,
    masterPelaksanaOptions,
    peraturanList,
    currentSopStatus,
    isRevisionFlow,
    primaryActionLabel,
    langkahList,
    createLangkah,
    updateLangkah,
    updateMetadataMutation,
    setSopStatusOverrideAsync,
  };
}
