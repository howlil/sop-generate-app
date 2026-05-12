import { useState, useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import {
  SOPPreviewTemplate,
  type SOPPreviewTemplateProps,
} from "@/pages/penyusun/sop/components/SOPPreviewTemplate";
import { usePenyusunWorkbench } from "@/api/sop";
import type { StatusSOP } from "@/types/dto/sop.dto";
import { DEFAULT_SOP_STATUS } from "@/types/dto/sop.dto";
import { mapPenyusunWorkbenchToPreviewProps } from "@/lib/sop/detailSop.mappers";
import { ROUTES } from "@/utils/constants";

export interface DetailSOPProps {
  /** Breadcrumb (default: Daftar SOP → Detail SOP). */
  breadcrumb?: { label: string; to?: string }[];
  /** Back link (default: Daftar SOP). */
  backTo?: string;
}

/**
 * Halaman detail SOP untuk Kepala OPD: hanya pantau (pratinjau + cetak), tanpa aksi pengesahan atau verifikasi.
 */
export function DetailSOP(props: DetailSOPProps = {}) {
  const { breadcrumb, backTo } = props;
  const params = useParams({ strict: false });
  const id = "id" in params ? params.id : undefined;

  const [activeTab, setActiveTab] = useState<"flowchart" | "bpmn">("flowchart");

  const { data: workbench } = usePenyusunWorkbench(id);

  const previewProps = useMemo(
    () => (workbench ? mapPenyusunWorkbenchToPreviewProps(workbench) : null),
    [workbench],
  );

  const sopStatus: StatusSOP =
    (workbench?.detail.status as StatusSOP | undefined) ?? DEFAULT_SOP_STATUS;
  const sopName = previewProps?.name ?? "";
  const sopNumber = previewProps?.number ?? "";

  const effectiveBreadcrumb = breadcrumb ?? [
    { label: "SOP", to: ROUTES.KEPALA_OPD.SOP },
    { label: "Detail SOP" },
  ];
  const effectiveBackTo = backTo ?? ROUTES.KEPALA_OPD.SOP;

  const workspaceHeaderToolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600">
        <StatusBadge status={sopStatus} className="text-xs border-0" />
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50"
          onClick={() => window.print()}
        >
          <Printer className="w-3.5 h-3.5" /> Print SOP
        </Button>
      </div>
    </div>
  );

  return (
    <DetailPageLayout
      breadcrumb={effectiveBreadcrumb}
      title="Detail Dokumen SOP"
      description={sopName}
      backTo={effectiveBackTo}
      backSize="icon"
      actions={null}
      header={workspaceHeaderToolbar}
      main={
        <div className="flex flex-col h-full p-4">
          <SOPPreviewTemplate
            name={sopName}
            number={sopNumber}
            metadata={
              previewProps?.metadata as SOPPreviewTemplateProps["metadata"]
            }
            prosedurRows={previewProps?.prosedurRows ?? []}
            implementers={previewProps?.implementers ?? []}
            tteSignaturePayload={undefined}
            previewOptions={{ editable: false }}
            diagramState={{
              activeTab,
              onActiveTabChange: setActiveTab,
            }}
          />
        </div>
      }
      rightPanel={null}
      workspaceClassName="print:hidden"
    />
  );
}
