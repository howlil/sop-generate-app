import { useCallback } from "react";
import type { NavigateOptions } from "@tanstack/react-router";
import { useToast } from "@/utils/toast";
import { useDetailSopPenyusunActions } from "./useDetailSopPenyusunActions";
import {
  useDetailSopPenyusunData,
  type KomentarDisplayItem,
} from "./useDetailSopPenyusunData";
import type { LogEditSOP } from "@/features/audit/types/audit";
import type { Peraturan } from "@/features/organisasi";
import type { ProsedurRow, SOPDetailMetadata, StatusSOP } from "@/types/common";

export type { KomentarDisplayItem };

export interface UseDetailSopPenyusunReturn {
  metadata: SOPDetailMetadata;
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
  const data = useDetailSopPenyusunData(sopDetailId, sopStatusOverride);

  const { handleSaveDraft, handleComplete } = useDetailSopPenyusunActions({
    metadata: data.metadata,
    prosedurRows: data.prosedurRows,
    langkahList: data.langkahList,
    createLangkah: data.createLangkah,
    updateLangkah: data.updateLangkah,
    updateMetadataMutation: data.updateMetadataMutation,
    setSopStatusOverrideAsync: data.setSopStatusOverrideAsync,
    showToast,
    isRevisionFlow: data.isRevisionFlow,
  });

  const handleMetadataChange = useCallback(
    <K extends keyof SOPDetailMetadata>(field: K, value: SOPDetailMetadata[K]) => {
      data.setMetadata((prev) => ({ ...prev, [field]: value }));
    },
    [data.setMetadata],
  );

  return {
    metadata: data.metadata,
    prosedurRows: data.prosedurRows,
    setProsedurRows: data.setProsedurRows,
    implementers: data.implementers,
    setImplementers: data.setImplementers,
    auditLogs: data.auditLogs,
    diagramVersion: data.diagramVersion,
    setDiagramVersion: data.setDiagramVersion,
    activeTab: data.activeTab,
    setActiveTab: data.setActiveTab,
    isEditingSteps: data.isEditingSteps,
    setIsEditingSteps: data.setIsEditingSteps,
    isEditPanelCollapsed: data.isEditPanelCollapsed,
    setIsEditPanelCollapsed: data.setIsEditPanelCollapsed,
    rightPanelTab: data.rightPanelTab,
    setRightPanelTab: data.setRightPanelTab,
    komentarDisplay: data.komentarDisplay,
    isLoading: data.isLoading,
    masterPelaksanaOptions: data.masterPelaksanaOptions,
    peraturanList: data.peraturanList,
    currentSopStatus: data.currentSopStatus,
    isRevisionFlow: data.isRevisionFlow,
    primaryActionLabel: data.primaryActionLabel,
    handleMetadataChange,
    handleSaveDraft,
    handleComplete,
  };
}
