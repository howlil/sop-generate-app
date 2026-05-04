import { useState, useMemo } from "react";
import { useParams, useLocation } from "@tanstack/react-router";
import {
  Calendar,
  Building2,
  Users,
  RefreshCw,
  Printer,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { SOPPreviewTemplate } from "@/pages/penyusun/sop/components/SOPPreviewTemplate";
import { InfoField } from "@/components/ui/info-field";
import { PinVerificationDialog } from "@/pages/pj-evaluator/tte/components/PinVerificationDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/useToast";
import { useSopStatus } from "@/api/sop";
import type { StatusSOP } from "@/types/dto/sop.dto";
import { DEFAULT_SOP_STATUS } from "@/types/dto/sop.dto";
import { getInitialSopDetailImplementers } from "@/lib/sop/detailSop.initial-state";
import { useDetailSopById } from "@/api/sop";
import { formatDateIdLong } from "@/utils/format-date";
import {
  useTandaTanganiSOP,
  createPinConfirmHandler,
  useTTEProfil,
} from "@/api/tte";
import { canKepalaOpdSignSop, isSopEligibleForSigning } from "@/api/sop";
import { ROUTES } from "@/utils/constants";

export interface DetailSOPProps {
  /** Breadcrumb (default: Daftar SOP → Detail SOP). */
  breadcrumb?: { label: string; to?: string }[];
  /** Back link (default: Daftar SOP). */
  backTo?: string;
  /** Tampilkan tombol Mengesahkan (TTE) bila SOP status Terverifikasi dari Biro. Default true (Kepala OPD). Set false untuk view-only (Biro). */
  showSignButton?: boolean;
}

export function DetailSOP(props: DetailSOPProps = {}) {
  const { breadcrumb, backTo, showSignButton = true } = props;
  const { showToast } = useToast();
  const { setSopStatusOverride } = useSopStatus();
  const params = useParams({ strict: false });
  const id = "id" in params ? params.id : undefined;
  const location = useLocation();
  const detailMetaState = location.state as
    | {
        sopStatus?: StatusSOP;
        waktuPenugasan?: string;
        unitTerkait?: string;
        penyusun?: string;
        terakhirDiperbarui?: string;
        deskripsiProyek?: string;
      }
    | undefined;

  const [activeTab, setActiveTab] = useState<"flowchart" | "bpmn">("flowchart");
  const [cabutConfirmOpen, setCabutConfirmOpen] = useState(false);

  const { data: sopDetail } = useDetailSopById(id ?? "");

  const implementers = getInitialSopDetailImplementers();
  const prosedurRows = useMemo((): import("@/types/ui/sop").ProsedurRow[] => {
    if (!sopDetail?.langkahSOP) return [];
    return sopDetail.langkahSOP
      .sort((a, b) => a.urutan - b.urutan)
      .map((langkah) => ({
        id: langkah.id,
        urutan: langkah.urutan,
        kegiatan: langkah.kegiatan,
        pelaksana: langkah.pelaksanaId,
        waktu: langkah.waktu,
        satuanWaktu: langkah.satuanWaktu as string | undefined,
        kelengkapan: langkah.kelengkapan,
        keluaran: langkah.keluaran,
        type: (langkah.jenis?.toLowerCase() ?? "task") as "terminator" | "task" | "decision",
      }));
  }, [sopDetail]);

  const sopStatus: StatusSOP =
    sopDetail?.status ?? detailMetaState?.sopStatus ?? DEFAULT_SOP_STATUS;

  // Transform API data to component format
  const metadata = useMemo(() => {
    if (!sopDetail)
      return {
        id: "",
        name: "",
        number: "",
        lembaga: "",
        logoUrl: "",
        createdDate: "",
        effectiveDate: "",
        revisionDate: "",
        version: 1,
        picName: "",
        picNumber: "",
      };
    return {
      id: sopDetail.id,
      name: sopDetail.sop?.judul ?? "",
      number: sopDetail.nomorSOP,
      lembaga: sopDetail.namaLembaga,
      logoUrl: sopDetail.logoInstansi,
      version: sopDetail.versi,
      createdDate: sopDetail.tanggalPembuatan ?? "",
      effectiveDate: sopDetail.tanggalEfektif ?? "",
      revisionDate: sopDetail.tanggalRevisi ?? "",
      picName: sopDetail.kepalaOpd?.nama?.trim() ?? "",
      picNumber: sopDetail.kepalaOpd?.nip?.trim() ?? "",
    };
  }, [sopDetail]);

  const tandaTanganiSOP = useTandaTanganiSOP();
  const { isSuccess: tteReady } = useTTEProfil();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const openPinDialog = () => setPinDialogOpen(true);

  const handlePinConfirm = createPinConfirmHandler(
    tandaTanganiSOP.mutateAsync,
    (pin) => ({
      sopDetailId: id ?? "",
      payload: {
        pin,
        nomorDokumen: metadata.number || id || "",
        judulDokumen: metadata.name,
      },
    }),
    () => {
      if (id) setSopStatusOverride(id, "BERLAKU");
    },
  );

  const handleCabutSop = () => {
    if (id) {
      setSopStatusOverride(id, "DICABUT");
      showToast("SOP berhasil dicabut.");
    }
  };

  /** Kepala OPD hanya menandatangani SOP (TTE). Tanpa tugas Setuju/Tolak atau pemeriksaan. */

  const effectiveBreadcrumb = breadcrumb ?? [
    { label: "SOP", to: ROUTES.KEPALA_OPD.SOP },
    { label: "Detail SOP" },
  ];
  const effectiveBackTo = backTo ?? ROUTES.KEPALA_OPD.SOP;
  const canShowSignButton = showSignButton && canKepalaOpdSignSop(sopStatus);
  const needBaSignFirst =
    showSignButton &&
    isSopEligibleForSigning({ status: sopStatus }) &&
    !canShowSignButton;

  const workspaceHeaderToolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Kiri: detail SOP (info + print + status) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600">
        <StatusBadge status={sopStatus} className="text-xs border-0" />
      </div>
      {/* Kanan: tombol aksi (Print + Tanda tangan) */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50"
          onClick={() => window.print()}
        >
          <Printer className="w-3.5 h-3.5" /> Print SOP
        </Button>
        {canShowSignButton && (
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={openPinDialog}
            disabled={!tteReady}
            title={
              !tteReady
                ? "Setup TTE terlebih dahulu"
                : "Mengesahkan SOP dengan TTE BSRE"
            }
          >
            Tanda tangan
          </Button>
        )}
        {needBaSignFirst && (
          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
            Berita Acara harus ditandatangani oleh PJ Penyusun terlebih dahulu sebelum SOP dapat disahkan.
          </span>
        )}
        {showSignButton && sopStatus === "BERLAKU" && id && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5 rounded-md border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            onClick={() => setCabutConfirmOpen(true)}
            title="Cabut SOP — status menjadi Dicabut"
          >
            <Ban className="w-3.5 h-3.5" /> Cabut SOP
          </Button>
        )}
      </div>
    </div>
  );

  const hasProyekInfo = Boolean(
    detailMetaState?.waktuPenugasan ??
    detailMetaState?.unitTerkait ??
    detailMetaState?.penyusun ??
    detailMetaState?.deskripsiProyek,
  );

  return (
    <>
      <DetailPageLayout
        breadcrumb={effectiveBreadcrumb}
        title="Detail Dokumen SOP"
        description={metadata.name}
        backTo={effectiveBackTo}
        backSize="icon"
        actions={null}
        header={
          <>
            {workspaceHeaderToolbar}
            {hasProyekInfo && (
              <>
                <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Informasi SOP
                  </h2>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-2">
                  {detailMetaState?.waktuPenugasan && (
                    <InfoField label="Waktu pembuatan" icon={<Calendar />}>
                      {detailMetaState.waktuPenugasan.includes("")
                        ? formatDateIdLong(
                            detailMetaState.waktuPenugasan + "T00:00:00",
                          )
                        : detailMetaState.waktuPenugasan}
                    </InfoField>
                  )}
                  {detailMetaState?.unitTerkait && (
                    <InfoField label="Unit" icon={<Building2 />}>
                      {detailMetaState.unitTerkait}
                    </InfoField>
                  )}
                  {detailMetaState?.penyusun && (
                    <InfoField label="Penyusun" icon={<Users />}>
                      {detailMetaState.penyusun}
                    </InfoField>
                  )}
                  {detailMetaState?.terakhirDiperbarui && (
                    <InfoField label="Diperbarui" icon={<RefreshCw />}>
                      {detailMetaState.terakhirDiperbarui}
                    </InfoField>
                  )}
                </div>
                {detailMetaState?.deskripsiProyek && (
                  <p
                    className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600 leading-relaxed max-w-full"
                    title={detailMetaState.deskripsiProyek}
                  >
                    {detailMetaState.deskripsiProyek}
                  </p>
                )}
              </>
            )}
          </>
        }
        main={
          <div className="flex flex-col h-full p-4">
            <SOPPreviewTemplate
              metadata={metadata}
              prosedurRows={prosedurRows}
              implementers={implementers.map((p) => ({
                id: p.id,
                name: p.nama,
              }))}
              tteSignaturePayload={undefined}
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
      <PinVerificationDialog
        open={pinDialogOpen}
        onOpenChange={setPinDialogOpen}
        title="Verifikasi PIN TTE"
        description="Masukkan PIN TTE BSRE untuk mengesahkan SOP ini."
        onConfirm={handlePinConfirm}
        confirmLabel="Mengesahkan"
      />
      <ConfirmDialog
        open={cabutConfirmOpen}
        onOpenChange={setCabutConfirmOpen}
        title="Cabut SOP?"
        description="SOP ini akan berstatus Dicabut dan tidak lagi berlaku. Anda dapat mengajukan evaluasi ulang jika nanti akan diaktifkan kembali."
        confirmLabel="Cabut SOP"
        cancelLabel="Batal"
        destructive
        onConfirm={handleCabutSop}
      />
    </>
  );
}
