import { useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { CheckCircle, Printer, Loader2 } from "lucide-react";
import { SOPPreviewTemplate } from "@/pages/penyusun/sop/components/SOPPreviewTemplate";
import type { SOPPreviewTemplateProps } from "@/pages/penyusun/sop/components/SOPPreviewTemplate";
import { SOPListCard } from "@/pages/penyusun/sop/components/SOPListCard";
import { formatDateId } from "@/utils/format-date";
import { PinVerificationDialog } from "@/pages/pj-evaluator/tte/components/PinVerificationDialog";
import { createPinConfirmHandler } from "@/api/tte";
import { useTandaTanganiBA } from "@/api/tte";
import {
  usePengajuanBeritaAcaraView,
  usePengajuanEvaluasiDetail,
  usePengajuanSopDokumenWorkbench,
} from "@/api/evaluasi";
import { mapPenyusunWorkbenchToPreviewProps } from "@/lib/sop/detailSop.mappers";
import { RiwayatEvaluasiTimeline } from "@/pages/pj-evaluator/evaluasi/components/RiwayatEvaluasiTimeline";
import { ROUTES } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { NotFoundWithBack } from "@/components/ui/not-found";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { CollapsibleSidePanel } from "@/components/ui/collapsible-side-panel";
import { PengajuanEvaluasiStatusHeader } from "@/components/evaluasi/pengajuan-evaluasi-status-header";
import { InfoField } from "@/components/ui/info-field";
import { BeritaAcaraTemplate } from "@/pages/penyusun/koordinator/berita-acara/components/BeritaAcaraTemplate";
import { InfoCard } from "@/components/ui/info-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { IA } from "@/utils/constants";

const PRINT_DELAY_MS = 150;

export function DetailPengajuanEvaluasi() {
  const { id } = useParams({
    from: "/pj-evaluator/evaluasi/$id",
  });
  const { pengajuan, isVerified, canVerify, loading } = usePengajuanEvaluasiDetail(id);
  const [previewMainTab, setPreviewMainTab] = useState<"sop" | "ba">("sop");
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null);
  const [tteDialogOpen, setTteDialogOpen] = useState(false);

  const tandaTanganiBA = useTandaTanganiBA({
    successMessage:
      "Verifikasi Berita Acara oleh PJ Evaluator berhasil. PJ Penyusun dapat melanjutkan verifikasi BA.",
  });

  const handlePinConfirm = createPinConfirmHandler(
    tandaTanganiBA.mutateAsync,
    (pin) => ({
      pengajuanId: pengajuan?.id ?? "",
      payload: {
        pin,
        nomorDokumen: pengajuan?.nomorBA ?? `BA-${pengajuan?.opdNama ?? ""}`,
        judulDokumen: `Berita Acara Evaluasi - ${pengajuan?.opdNama ?? ""}`,
      },
    }),
  );

  const sopList = pengajuan?.sopList ?? [];
  const firstSopDetailId = sopList[0]?.sopDetailId ?? null;
  const effectiveSopDetailId = selectedSopId ?? firstSopDetailId;
  const displaySop = sopList.find(
    (s) => s.sopDetailId === effectiveSopDetailId,
  );

  const sopWorkbenchEnabled = Boolean(
    pengajuan && previewMainTab === "sop" && effectiveSopDetailId,
  );
  const { data: sopDokumen, isFetching: sopWorkbenchLoading } =
    usePengajuanSopDokumenWorkbench(id, effectiveSopDetailId, {
      enabled: sopWorkbenchEnabled,
    });

  const sopPreviewProps = useMemo(() => {
    const wb = sopDokumen?.workbench;
    if (wb === undefined) {
      return null;
    }
    return mapPenyusunWorkbenchToPreviewProps(wb);
  }, [sopDokumen]);

  const baViewEnabled = Boolean(pengajuan && previewMainTab === "ba");
  const { data: baView, isFetching: baViewLoading } = usePengajuanBeritaAcaraView(
    id,
    { enabled: baViewEnabled },
  );

  useDocumentTitle(
    pengajuan
      ? `${IA.TERJADWAL_EVALUASI_OPD} — ${pengajuan.opdNama}`
      : undefined,
  );

  if (loading && pengajuan === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[320px] text-gray-600 text-sm">
        <Loader2 className="h-9 w-9 animate-spin text-gray-400" aria-hidden />
        <p>Memuat pengajuan evaluasi…</p>
      </div>
    );
  }

  if (pengajuan === null) {
    return (
      <NotFoundWithBack
        message="Pengajuan evaluasi tidak ditemukan."
        backAction={
          <BackButton to={ROUTES.PJ_EVALUATOR.EVALUASI}>
            Kembali
          </BackButton>
        }
      />
    );
  }

  return (
    <>
      <DetailPageLayout
        breadcrumb={[
          {
            label: IA.NAV_BIRO_EVALUASI_TERJADWAL,
            to: ROUTES.PJ_EVALUATOR.EVALUASI,
          },
          { label: pengajuan.opdNama ?? "" },
        ]}
        title={`${IA.TERJADWAL_EVALUASI_OPD} — ${pengajuan.opdNama}`}
        description={`${IA.VERIFIKASI_BA_BIRO} pada dokumen ${IA.BERITA_ACARA}. Setelah ini: PJ Penyusun → ${IA.PENGESAHAN_SOP} oleh Kepala OPD.`}
        backTo={ROUTES.PJ_EVALUATOR.EVALUASI}
        backSize="icon"
        header={
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-gray-900">
                Informasi OPD & Evaluasi
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => {
                    setPreviewMainTab("ba");
                    setTimeout(() => window.print(), PRINT_DELAY_MS);
                  }}
                  title="Cetak Berita Acara"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak BA
                </Button>
                {canVerify && (
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => setTteDialogOpen(true)}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verifikasi BA
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
              <InfoField label="OPD">{pengajuan.opdNama}</InfoField>
              <InfoField label="Jenis">{pengajuan.jenis}</InfoField>
              <InfoField label="Tanggal Evaluasi">
                {pengajuan.tanggalEvaluasi
                  ? formatDateId(pengajuan.tanggalEvaluasi)
                  : ""}
              </InfoField>
              {pengajuan.nilaiOPD && (
                <InfoField label="Nilai OPD">
                  {pengajuan.nilaiOPD.toString()}
                </InfoField>
              )}
            </div>
            <PengajuanEvaluasiStatusHeader
              status={pengajuan.status}
              statusLabel={pengajuan.statusLabel ?? pengajuan.status}
              role="PJ_EVALUATOR"
            />
            {isVerified && (
              <InfoCard
                variant="success"
                icon={<CheckCircle />}
                title="Berita Acara telah diverifikasi"
              >
                PJ Penyusun dapat melanjutkan verifikasi. Setelah itu, Kepala
                OPD dapat mengesahkan SOP.
              </InfoCard>
            )}
          </div>
        }
        leftPanel={
          <CollapsibleSidePanel
            side="left"
            collapsed={leftPanelCollapsed}
            onCollapsedChange={setLeftPanelCollapsed}
            widthCollapsed="w-10"
            widthExpanded="w-[min(300px,36vw)]"
            title="Daftar SOP"
          >
            <SOPListCard
              items={sopList.map((sop) => ({
                id: sop.sopDetailId,
                nama: sop.nama,
                nomor: sop.nomor,
                statusDokumen: sop.status,
                statusDokumenLabel: sop.statusLabel ?? sop.status,
                hasilEvaluasi: sop.hasil,
                hasilEvaluasiLabel: sop.hasilLabel,
              }))}
              selectedId={effectiveSopDetailId}
              onSelect={setSelectedSopId}
            />
          </CollapsibleSidePanel>
        }
        rightPanel={
          <CollapsibleSidePanel
            side="right"
            collapsed={rightPanelCollapsed}
            onCollapsedChange={setRightPanelCollapsed}
            widthCollapsed="w-10"
            widthExpanded="w-[min(320px,28vw)]"
            title="Riwayat evaluasi"
          >
            <RiwayatEvaluasiTimeline logs={pengajuan.riwayatEvaluasi ?? []} />
          </CollapsibleSidePanel>
        }
      >
        <Tabs
          value={previewMainTab}
          onValueChange={(value) => setPreviewMainTab(value as "sop" | "ba")}
          className="flex h-full min-h-0 flex-col"
        >
          <div className="border-b border-gray-200 px-0 py-1">
            <TabsList className="h-7 gap-1 bg-transparent p-0" aria-label="Pratinjau dokumen">
              <TabsTrigger value="sop" className="h-7 px-2.5 text-xs">
                Pratinjau SOP
              </TabsTrigger>
              <TabsTrigger value="ba" className="h-7 px-2.5 text-xs">
                Berita Acara
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="sop"
            className="mt-1 flex min-h-0 flex-1 flex-col overflow-auto px-0 pb-0.5 sm:px-0.5"
          >
            {displaySop === undefined ? (
              <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-500">
                Tidak ada SOP untuk ditampilkan.
              </div>
            ) : sopWorkbenchLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500 text-sm">
                <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                Memuat dokumen SOP…
              </div>
            ) : sopPreviewProps !== null ? (
              <SOPPreviewTemplate
                name={sopPreviewProps.name}
                number={sopPreviewProps.number}
                metadata={
                  sopPreviewProps.metadata as SOPPreviewTemplateProps["metadata"]
                }
                prosedurRows={sopPreviewProps.prosedurRows}
                implementers={sopPreviewProps.implementers}
                previewOptions={{ editable: false, showScrollbar: true }}
              />
            ) : (
              <SOPPreviewTemplate
                name={displaySop.nama}
                number={displaySop.nomor}
                previewOptions={{ editable: false, showScrollbar: true }}
              />
            )}
          </TabsContent>

          <TabsContent
            value="ba"
            className="mt-1 flex min-h-0 flex-1 flex-col overflow-auto px-0 pb-0.5 sm:px-0.5"
          >
            {baViewLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500 text-sm">
                <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                Memuat Berita Acara…
              </div>
            ) : (
              <div className="w-full">
                <BeritaAcaraTemplate
                  opd={baView?.namaOpd ?? pengajuan.opdNama ?? ""}
                  nomorBA={baView?.nomorBA ?? pengajuan.nomorBA}
                  tanggalVerifikasi={
                    baView?.tanggalVerifikasiPjEvaluator ??
                    pengajuan.tanggalVerifikasi ??
                    undefined
                  }
                  namaBiro={
                    pengajuan.namaPjEvaluator ??
                    baView?.timEvaluasi.penanggungJawabSelesai?.nama
                  }
                  namaPjPenyusun={pengajuan.namaPjPenyusun ?? "PJ Penyusun OPD"}
                  ringkasanHasilPerSop={baView?.hasilPerSop}
                  nilaiKeseluruhanOpd={
                    baView?.nilaiKeseluruhanOpd ?? pengajuan.nilaiOPD
                  }
                  tteSignaturePayloadPjEvaluator={baView?.tteBeritaAcara?.payloadPjEvaluator}
                  tteSignaturePayloadPjPenyusun={baView?.tteBeritaAcara?.payloadPjPenyusun}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DetailPageLayout>

      <PinVerificationDialog
        open={tteDialogOpen}
        onOpenChange={setTteDialogOpen}
        title="Verifikasi Berita Acara"
        onConfirm={handlePinConfirm}
      />
    </>
  );
}
