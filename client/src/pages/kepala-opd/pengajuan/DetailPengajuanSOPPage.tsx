import { useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { AlertCircle, CheckCircle, Loader2, Printer } from "lucide-react";
import { usePengajuanBeritaAcaraView, usePengajuanEvaluasiDetail, usePengajuanSopDokumenWorkbench } from "@/api/evaluasi";
import { createPinConfirmHandler, useTandaTanganiSopPengajuan } from "@/api/tte";
import { mapPenyusunWorkbenchToPreviewProps } from "@/lib/sop/detailSop.mappers";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { NotFoundWithBack } from "@/components/ui/not-found";
import { InfoCard } from "@/components/ui/info-card";
import { InfoField } from "@/components/ui/info-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { CollapsibleSidePanel } from "@/components/ui/collapsible-side-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PinVerificationDialog } from "@/pages/pj-evaluator/tte/components/PinVerificationDialog";
import { SOPPreviewTemplate, type SOPPreviewTemplateProps } from "@/pages/penyusun/sop/components/SOPPreviewTemplate";
import { SOPListCard } from "@/pages/penyusun/sop/components/SOPListCard";
import { BeritaAcaraTemplate } from "@/pages/penyusun/koordinator/berita-acara/components/BeritaAcaraTemplate";
import { ROUTES } from "@/utils/constants";

const PRINT_DELAY_MS = 150;
const STATUS_SOP_SIAP_TTD_KEPALA_OPD = "DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI";

function formatDate(value: string | undefined | null): string {
  if (value == null || value.trim() === "") return "—";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function mapStatusEvaluasiSop(hasil: string | undefined): string {
  if (hasil === "SESUAI") return "SELESAI_DIEVALUASI";
  if (hasil === "PERLU_PERBAIKAN") return "REVISI_DARI_EVALUATOR";
  return "BELUM_DINILAI";
}

export function DetailPengajuanSOPPage() {
  const { id } = useParams({ from: "/kepala-opd/pengajuan/$id" });

  const { pengajuan, loading } = usePengajuanEvaluasiDetail(id);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null);
  const [previewMainTab, setPreviewMainTab] = useState<"sop" | "ba">("sop");
  const [pinDialogOpen, setPinDialogOpen] = useState(false);

  const allSopList = pengajuan?.sopList ?? [];
  const canSignAll = pengajuan?.status === "DITANDATANGANI_PJ_PENYUSUN";
  const isSudahBerlaku = pengajuan?.status === "SELESAI";
  const sopList = useMemo(
    () =>
      canSignAll
        ? allSopList.filter((item) => item.status === STATUS_SOP_SIAP_TTD_KEPALA_OPD)
        : allSopList,
    [allSopList, canSignAll],
  );
  const sopTidakEligibleCount = allSopList.length - sopList.length;
  const firstSopDetailId = sopList[0]?.sopDetailId ?? null;
  const effectiveSopDetailId = selectedSopId ?? firstSopDetailId;
  const selectedSop = sopList.find((item) => item.sopDetailId === effectiveSopDetailId) ?? null;

  const sopWorkbenchEnabled = Boolean(previewMainTab === "sop" && effectiveSopDetailId);
  const { data: sopDokumen, isFetching: sopWorkbenchLoading } = usePengajuanSopDokumenWorkbench(
    id,
    effectiveSopDetailId,
    { enabled: sopWorkbenchEnabled },
  );
  const sopPreviewProps = useMemo(() => {
    const wb = sopDokumen?.workbench;
    if (wb === undefined) return null;
    return mapPenyusunWorkbenchToPreviewProps(wb);
  }, [sopDokumen]);

  const baViewEnabled = Boolean(pengajuan && previewMainTab === "ba");
  const { data: baView, isFetching: baViewLoading } = usePengajuanBeritaAcaraView(id, {
    enabled: baViewEnabled,
  });

  const tandaTanganiSemuaSop = useTandaTanganiSopPengajuan();
  const handlePinConfirm = createPinConfirmHandler(
    tandaTanganiSemuaSop.mutateAsync,
    (pin) => ({
      pengajuanId: id,
      payload: {
        pin,
        nomorDokumen: pengajuan?.nomorBA ?? `PGJ-${pengajuan?.opdNama ?? ""}`,
        judulDokumen: `Pengesahan SOP OPD - ${pengajuan?.opdNama ?? ""}`,
      },
    }),
  );

  if (loading && pengajuan === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[320px] text-gray-600 text-sm">
        <Loader2 className="h-9 w-9 animate-spin text-gray-400" aria-hidden />
        <p>Memuat detail pengajuan SOP...</p>
      </div>
    );
  }

  if (pengajuan === null) {
    return (
      <NotFoundWithBack
        message="Pengajuan SOP tidak ditemukan."
        backAction={
          <BackButton to={ROUTES.KEPALA_OPD.PENGAJUAN}>
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
          { label: "Pengajuan SOP", to: ROUTES.KEPALA_OPD.PENGAJUAN },
          { label: "Detail Pengajuan" },
        ]}
        title="Detail Pengajuan SOP"
        description={pengajuan.opdNama ?? ""}
        backTo={ROUTES.KEPALA_OPD.PENGAJUAN}
        backSize="icon"
        header={
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-sm font-semibold text-gray-900">Informasi Pengajuan</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => {
                    setPreviewMainTab("ba");
                    setTimeout(() => window.print(), PRINT_DELAY_MS);
                  }}
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak BA
                </Button>
                {canSignAll && (
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => setPinDialogOpen(true)}
                    disabled={tandaTanganiSemuaSop.isPending}
                  >
                    {tandaTanganiSemuaSop.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Menandatangani...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Tanda Tangan Semua SOP
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
              <InfoField label="OPD">{pengajuan.opdNama ?? pengajuan.opd?.nama ?? "—"}</InfoField>
              <InfoField label="Jenis">{pengajuan.jenis}</InfoField>
              <InfoField label="Status">
                <StatusBadge status={pengajuan.status} />
              </InfoField>
              <InfoField label="Nomor BA">
                <span className="font-mono">{pengajuan.nomorBA ?? "—"}</span>
              </InfoField>
              <InfoField label="Tanggal BA Ditandatangani PJ Penyusun">
                {formatDate(pengajuan.tanggalTTDBaPjPenyusun)}
              </InfoField>
              <InfoField label="Jumlah SOP">{`${sopList.length} dokumen`}</InfoField>
            </div>
            {!canSignAll && !isSudahBerlaku && (
              <InfoCard variant="warning" icon={<AlertCircle />} title="Pengajuan belum siap ditandatangani">
                Pengajuan harus berstatus ditandatangani PJ Penyusun sebelum disahkan Kepala OPD.
              </InfoCard>
            )}
            {isSudahBerlaku && (
              <InfoCard variant="success" icon={<CheckCircle />} title="Pengajuan sudah berlaku">
                Seluruh SOP pada pengajuan ini sudah ditandatangani Kepala OPD.
              </InfoCard>
            )}
            {canSignAll && sopTidakEligibleCount > 0 && (
              <InfoCard variant="warning" icon={<AlertCircle />} title="Sebagian SOP belum eligible TTD">
                {sopTidakEligibleCount} SOP disembunyikan karena status SOP belum{" "}
                {STATUS_SOP_SIAP_TTD_KEPALA_OPD}.
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
              items={sopList.map((item) => ({
                id: item.sopDetailId,
                nama: item.nama,
                nomor: item.nomor,
                statusSop: item.status,
                statusEvaluasi: mapStatusEvaluasiSop(item.hasil),
              }))}
              selectedId={effectiveSopDetailId}
              onSelect={setSelectedSopId}
            />
          </CollapsibleSidePanel>
        }
      >
        <Tabs
          value={previewMainTab}
          onValueChange={(value) => setPreviewMainTab(value as "sop" | "ba")}
          className="flex h-full min-h-0 flex-col"
        >
          <div className="border-b border-gray-200 px-2 py-2">
            <TabsList className="h-8 bg-transparent p-0 gap-2">
              <TabsTrigger value="sop" className="h-8 text-xs">
                Pratinjau SOP
              </TabsTrigger>
              <TabsTrigger value="ba" className="h-8 text-xs">
                Pratinjau Berita Acara
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sop" className="mt-3 flex min-h-0 flex-1 flex-col overflow-auto px-2 pb-2">
            {selectedSop === null ? (
              <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-500">
                Tidak ada SOP untuk ditampilkan.
              </div>
            ) : sopWorkbenchLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500 text-sm">
                <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                Memuat dokumen SOP...
              </div>
            ) : sopPreviewProps !== null ? (
              <SOPPreviewTemplate
                name={sopPreviewProps.name}
                number={sopPreviewProps.number}
                metadata={sopPreviewProps.metadata as SOPPreviewTemplateProps["metadata"]}
                prosedurRows={sopPreviewProps.prosedurRows}
                implementers={sopPreviewProps.implementers}
                previewOptions={{ editable: false, showScrollbar: true }}
              />
            ) : (
              <SOPPreviewTemplate
                name={selectedSop.nama}
                number={selectedSop.nomor}
                previewOptions={{ editable: false, showScrollbar: true }}
              />
            )}
          </TabsContent>

          <TabsContent value="ba" className="mt-2 flex min-h-0 flex-1 flex-col overflow-auto px-1 pb-1 sm:px-2">
            {baViewLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500 text-sm">
                <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                Memuat Berita Acara...
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
                  namaBiro={pengajuan.namaPjEvaluator}
                  namaPjPenyusun={pengajuan.namaPjPenyusun ?? "PJ Penyusun OPD"}
                  ringkasanHasilPerSop={baView?.hasilPerSop}
                  nilaiKeseluruhanOpd={baView?.nilaiKeseluruhanOpd ?? pengajuan.nilaiOPD}
                  tteSignaturePayloadPjEvaluator={baView?.tteBeritaAcara?.payloadPjEvaluator}
                  tteSignaturePayloadPjPenyusun={baView?.tteBeritaAcara?.payloadPjPenyusun}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DetailPageLayout>

      <PinVerificationDialog
        open={pinDialogOpen}
        onOpenChange={setPinDialogOpen}
        title="Verifikasi PIN TTE"
        description="Masukkan PIN TTE untuk menandatangani seluruh SOP pada pengajuan ini."
        onConfirm={handlePinConfirm}
        confirmLabel="Tanda Tangani"
      />
    </>
  );
}
