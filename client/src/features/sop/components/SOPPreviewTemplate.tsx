import type { ReactNode } from "react";
import { useState, useMemo } from "react";
import {
  SOPHeaderInfo,
  type SOPHeaderInfoProps,
} from "./SOPDiagram/SOPHeaderInfo";
import { SOPDiagramFlowchart } from "./SOPDiagram/SOPDiagramFlowchart";
import { SOPDiagramBpmn } from "./SOPDiagram/SOPDiagramBpmn";
import { rowsToSteps } from "./SOPDiagram/logic/sopDiagramTypes";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TTESignaturePayload } from "@/features/tte";
import type { ProsedurRow } from "@/types/common";
import {
  getInitialSopDetailMetadata,
  getInitialSopDetailImplementers,
} from "../hooks/useDetailSop";

const DEFAULT_METADATA = getInitialSopDetailMetadata();
const DEFAULT_PROSEDUR_ROWS: ProsedurRow[] = [];
const DEFAULT_IMPLEMENTERS = getInitialSopDetailImplementers().map((p) => ({
  id: p.id,
  name: p.nama,
}));

export interface SOPPreviewTemplateProps {
  /** Override nama SOP (default: Percobaan) */
  name?: string;
  /** Override nomor SOP */
  number?: string;
  /** TTE signature payload jika SOP sudah disahkan */
  tteSignaturePayload?: TTESignaturePayload | null;
  /** Sembunyikan tab Flowchart/BPMN (hanya tampil flowchart) */
  hideDiagramTabs?: boolean;
  /** Metadata lengkap (jika ada, dipakai untuk header; jika tidak, pakai seed + name/number) */
  metadata?: Partial<SOPHeaderInfoProps> & { name: string };
  /** Prosedur rows (jika tidak ada, pakai seed) */
  prosedurRows?: ProsedurRow[];
  /** Implementers (jika tidak ada, pakai seed) */
  implementers?: { id: string; name: string }[];
  /** Seed layout flowchart (e.g. diagramVersion) */
  pathLayoutSeed?: number;
  /** Header editable + callback */
  editable?: boolean;
  onMetadataChange?: (field: string, value: unknown) => void;
  /** Tab aktif (controlled) */
  activeTab?: "flowchart" | "bpmn";
  onActiveTabChange?: (v: "flowchart" | "bpmn") => void;
  /** Toolbar di atas diagram (e.g. Ubah langkah, Perbaiki diagram) */
  toolbar?: ReactNode;
  /** Jika ada, tampilkan ini instead of diagram (e.g. editor prosedur) */
  diagramAlternate?: ReactNode;
}

export function SOPPreviewTemplate({
  name: nameOverride,
  number: numberOverride,
  tteSignaturePayload = null,
  hideDiagramTabs = false,
  metadata: metadataOverride,
  prosedurRows = DEFAULT_PROSEDUR_ROWS,
  implementers = DEFAULT_IMPLEMENTERS,
  pathLayoutSeed = 0,
  editable = false,
  onMetadataChange,
  activeTab: controlledActiveTab,
  onActiveTabChange,
  toolbar,
  diagramAlternate,
}: SOPPreviewTemplateProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<
    "flowchart" | "bpmn"
  >("flowchart");
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const setActiveTab = onActiveTabChange ?? setInternalActiveTab;

  // Defensive normalization: persisted/legacy data may contain empty implementer names.
  const safeImplementers = useMemo(
    () =>
      (implementers ?? []).map((impl, index) => ({
        id: impl?.id ?? `impl-${index + 1}`,
        name: (impl?.name ?? impl?.id ?? `Pelaksana ${index + 1}`).toString(),
      })),
    [implementers],
  );

  const diagramSteps = useMemo(
    () => rowsToSteps(prosedurRows, safeImplementers),
    [prosedurRows, safeImplementers],
  );

  const metadata: SOPHeaderInfoProps = {
    ...DEFAULT_METADATA,
    ...(nameOverride != null && { name: nameOverride }),
    ...(numberOverride != null && { number: numberOverride }),
    ...metadataOverride,
  } as SOPHeaderInfoProps;

  return (
    <div className="flex-1 min-h-0 overflow-auto scrollbar-hide">
      <div className="sop-a4-preview p-2">
        <div className="space-y-8">
          <SOPHeaderInfo
            {...metadata}
            editable={editable}
            onMetadataChange={onMetadataChange}
            tteSignaturePayload={tteSignaturePayload}
          />

          {diagramAlternate != null ? (
            <div className="flex justify-center">{diagramAlternate}</div>
          ) : (
            <>
              {!hideDiagramTabs && (
                <div className="flex justify-center print:hidden">
                  {toolbar ?? (
                    <Tabs
                      value={activeTab}
                      onValueChange={(v: string) =>
                        setActiveTab(v as "flowchart" | "bpmn")
                      }
                      className="w-full max-w-md mx-auto"
                    >
                      <TabsList className="h-9 w-full grid grid-cols-2 rounded-lg border border-gray-200 bg-gray-50 p-1 shadow-sm">
                        <TabsTrigger
                          value="flowchart"
                          className="h-7 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                        >
                          Flowchart
                        </TabsTrigger>
                        <TabsTrigger
                          value="bpmn"
                          className="h-7 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                        >
                          BPMN
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  )}
                </div>
              )}

              <div className="w-full">
                {activeTab === "flowchart" ? (
                  <SOPDiagramFlowchart
                    rows={prosedurRows}
                    steps={diagramSteps}
                    implementers={safeImplementers}
                    pathLayoutSeed={pathLayoutSeed}
                  />
                ) : (
                  <SOPDiagramBpmn
                    name={metadata.name}
                    steps={diagramSteps}
                    implementers={safeImplementers}
                    pathLayoutSeed={pathLayoutSeed}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
