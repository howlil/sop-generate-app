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
import type { TTESignaturePayload } from "@/types/dto/tte.dto";
import type { ProsedurRow, SOPDetailMetadata } from "@/types/ui/sop";
import {
  getInitialSopDetailMetadata,
  getInitialSopDetailImplementers,
} from "@/lib/sop/detailSop.initial-state";
import { SOP_DOCUMENT_CONTENT_WRAPPER_CLASS } from "./SOPDiagram/logic/sopDocumentLayout";

const DEFAULT_METADATA = getInitialSopDetailMetadata();
const DEFAULT_PROSEDUR_ROWS: ProsedurRow[] = [];
const DEFAULT_IMPLEMENTERS = getInitialSopDetailImplementers().map((p) => ({
  id: p.id,
  name: p.nama,
}));

interface SopPreviewOptions {
  hideDiagramTabs?: boolean;
  editable?: boolean;
  /** Kontrol tambahan di samping tab Flowchart/BPMN (bukan pengganti tab). */
  toolbar?: ReactNode;
  diagramAlternate?: ReactNode;
  /**
   * Tampilkan scrollbar internal pratinjau. Default `false` (mengikuti tampilan A4 cetak).
   * Set `true` di konteks read-only/verifikasi agar pengguna sadar konten dapat di-scroll.
   */
  showScrollbar?: boolean;
}

interface SopPreviewDiagramState {
  pathLayoutSeed?: number;
  activeTab?: "flowchart" | "bpmn";
  onActiveTabChange?: (v: "flowchart" | "bpmn") => void;
}

type SopPreviewMetadata = Partial<
  Omit<SOPHeaderInfoProps, "implementQualification" | "equipment" | "recordData">
> &
  Partial<SOPDetailMetadata> & { name?: string };

export interface SOPPreviewTemplateProps {
  /** Override nama SOP (default: Percobaan) */
  name?: string;
  /** Override nomor SOP */
  number?: string;
  /** TTE signature payload jika SOP sudah disahkan */
  tteSignaturePayload?: TTESignaturePayload | null;
  /** Metadata lengkap (jika ada, dipakai untuk header; jika tidak, pakai seed + name/number) */
  metadata?: SopPreviewMetadata;
  /** Prosedur rows (jika tidak ada, pakai seed) */
  prosedurRows?: ProsedurRow[];
  /** Implementers (jika tidak ada, pakai seed) */
  implementers?: { id: string; name: string }[];
  onMetadataChange?: (field: string, value: unknown) => void;
  /** Grouped options for view behavior */
  previewOptions?: SopPreviewOptions;
  /** Grouped options for diagram state */
  diagramState?: SopPreviewDiagramState;
}

export function SOPPreviewTemplate({
  name: nameOverride,
  number: numberOverride,
  tteSignaturePayload = null,
  metadata: metadataOverride,
  prosedurRows = DEFAULT_PROSEDUR_ROWS,
  implementers = DEFAULT_IMPLEMENTERS,
  onMetadataChange,
  previewOptions = {},
  diagramState = {},
}: SOPPreviewTemplateProps) {
  const effectiveOptions: Required<SopPreviewOptions> = {
    hideDiagramTabs: previewOptions.hideDiagramTabs ?? false,
    editable: previewOptions.editable ?? false,
    toolbar: previewOptions.toolbar ?? null,
    diagramAlternate: previewOptions.diagramAlternate ?? null,
    showScrollbar: previewOptions.showScrollbar ?? false,
  };
  const effectiveDiagramState: Required<SopPreviewDiagramState> = {
    pathLayoutSeed: diagramState.pathLayoutSeed ?? 0,
    activeTab: diagramState.activeTab ?? "flowchart",
    onActiveTabChange: diagramState.onActiveTabChange ?? (() => {}),
  };

  const [internalActiveTab, setInternalActiveTab] = useState<
    "flowchart" | "bpmn"
  >("flowchart");
  const isControlledActiveTab = diagramState.activeTab != null;
  const activeTab = isControlledActiveTab
    ? effectiveDiagramState.activeTab
    : internalActiveTab;
  const setActiveTab = isControlledActiveTab
    ? effectiveDiagramState.onActiveTabChange
    : setInternalActiveTab;

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

  /** Selaraskan field metadata penyusun/API (`tanggalPembuatan`, `nama`) ke props header cetak. */
  const metadata: SOPHeaderInfoProps = {
    ...DEFAULT_METADATA,
    ...(nameOverride != null && { name: nameOverride }),
    ...(numberOverride != null && { number: numberOverride }),
    ...metadataOverride,
    implementQualification:
      typeof metadataOverride?.implementQualification === "string"
        ? [metadataOverride.implementQualification]
        : metadataOverride?.implementQualification ??
          (Array.isArray(DEFAULT_METADATA.implementQualification)
            ? DEFAULT_METADATA.implementQualification
            : []),
    equipment:
      typeof metadataOverride?.equipment === "string"
        ? [metadataOverride.equipment]
        : metadataOverride?.equipment ??
          (Array.isArray(DEFAULT_METADATA.equipment) ? DEFAULT_METADATA.equipment : []),
    recordData:
      typeof metadataOverride?.recordData === "string"
        ? [metadataOverride.recordData]
        : metadataOverride?.recordData ??
          (Array.isArray(DEFAULT_METADATA.recordData) ? DEFAULT_METADATA.recordData : []),
    ...(metadataOverride &&
    metadataOverride.tanggalPembuatan != null &&
    String(metadataOverride.tanggalPembuatan).trim() !== ""
      ? { createdDate: String(metadataOverride.tanggalPembuatan) }
      : {}),
    ...(metadataOverride &&
    metadataOverride.tanggalRevisi != null &&
    String(metadataOverride.tanggalRevisi).trim() !== ""
      ? { revisionDate: String(metadataOverride.tanggalRevisi) }
      : {}),
    ...(metadataOverride &&
    metadataOverride.tanggalEfektif != null &&
    String(metadataOverride.tanggalEfektif).trim() !== ""
      ? { effectiveDate: String(metadataOverride.tanggalEfektif) }
      : {}),
    ...(metadataOverride &&
    !metadataOverride.name &&
    metadataOverride.nama != null &&
    String(metadataOverride.nama).trim() !== ""
      ? { name: String(metadataOverride.nama) }
      : {}),
  } as SOPHeaderInfoProps;

  const hasDiagramToolbar = effectiveOptions.toolbar != null;

  return (
    <div
      className={
        effectiveOptions.showScrollbar
          ? "flex-1 min-h-0 overflow-auto"
          : "flex-1 min-h-0 overflow-auto scrollbar-hide"
      }
    >
      <div className="sop-a4-preview p-2">
        <div className="space-y-8">
          <SOPHeaderInfo
            {...metadata}
            editable={effectiveOptions.editable}
            onMetadataChange={onMetadataChange}
            tteSignaturePayload={tteSignaturePayload}
          />

          {effectiveOptions.diagramAlternate != null ? (
            <div className="flex justify-center">{effectiveOptions.diagramAlternate}</div>
          ) : (
            <>
              {!effectiveOptions.hideDiagramTabs && (
                <div className="flex justify-center px-1 print:hidden">
                  <div
                    role="toolbar"
                    aria-label="Kontrol diagram SOP"
                    className={
                      hasDiagramToolbar
                        ? 'inline-flex w-fit max-w-full flex-col items-center gap-2 rounded-xl border border-gray-200/90 bg-slate-50/95 px-2 py-1.5 shadow-sm ring-1 ring-gray-950/[0.04] sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-2 sm:gap-y-1.5 sm:px-2.5 sm:py-1.5'
                        : 'inline-flex w-fit max-w-full flex-col items-stretch rounded-xl border border-gray-200/90 bg-white px-2 py-2 shadow-sm ring-1 ring-gray-950/[0.04]'
                    }
                  >
                    {hasDiagramToolbar ? (
                      <>
                        <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5">
                          {effectiveOptions.toolbar}
                        </div>
                        <div
                          className="hidden h-8 w-px shrink-0 bg-gray-300/90 sm:mx-0.5 sm:block"
                          aria-hidden
                        />
                      </>
                    ) : null}
                    <Tabs
                      value={activeTab}
                      onValueChange={(v: string) =>
                        setActiveTab(v as "flowchart" | "bpmn")
                      }
                      className={
                        hasDiagramToolbar
                          ? "w-auto shrink-0"
                          : "w-auto min-w-[13.5rem]"
                      }
                    >
                      <TabsList className="grid h-9 w-auto min-w-[13.5rem] grid-cols-2 gap-0.5 rounded-lg bg-white/60 p-0.5 ring-1 ring-gray-200/60 sm:h-9">
                        <TabsTrigger
                          value="flowchart"
                          className="h-8 rounded-md text-xs font-medium text-gray-600 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-gray-200/80 data-[state=inactive]:hover:bg-white/60 data-[state=inactive]:hover:text-gray-800"
                        >
                          Flowchart
                        </TabsTrigger>
                        <TabsTrigger
                          value="bpmn"
                          className="h-8 rounded-md text-xs font-medium text-gray-600 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-gray-200/80 data-[state=inactive]:hover:bg-white/60 data-[state=inactive]:hover:text-gray-800"
                        >
                          BPMN
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              )}

              {/* Kulit scroll sama; kolom dalam beda Flowchart vs BPMN (routing/measure BPMN sensitif pada lebar blok). */}
              <div className="flex justify-center">
                <div className="min-w-0 w-full overflow-x-auto px-4 lg:px-0 print:px-0">
                  {activeTab === "flowchart" ? (
                    /* Flowchart lebar tetap A4 → mx-auto pusat blok di viewport lebar */
                    <div className={`mx-auto ${SOP_DOCUMENT_CONTENT_WRAPPER_CLASS}`}>
                      <SOPDiagramFlowchart
                        data={{
                          rows: prosedurRows,
                          steps: diagramSteps,
                          implementers: safeImplementers,
                        }}
                        config={{
                          pathLayoutSeed: effectiveDiagramState.pathLayoutSeed,
                        }}
                      />
                    </div>
                  ) : (
                    /* BPMN: lebar swimlane mengikuti kolom cetak yang sama dengan header */
                    <div className={SOP_DOCUMENT_CONTENT_WRAPPER_CLASS}>
                      <SOPDiagramBpmn
                        data={{
                          name: metadata.name,
                          steps: diagramSteps,
                          implementers: safeImplementers,
                        }}
                        config={{
                          pathLayoutSeed: effectiveDiagramState.pathLayoutSeed,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
