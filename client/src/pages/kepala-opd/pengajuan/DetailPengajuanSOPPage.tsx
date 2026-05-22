import { useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { AlertCircle, CheckCircle, FileText, Loader2 } from "lucide-react";
import { PengajuanCetakArsipButtons } from "@/components/pengajuan/PengajuanCetakArsipButtons";
import { PengajuanSopPrintLayer } from "@/components/pengajuan/pengajuan-sop-print-layer";
import { usePengajuanCetakArsip } from "@/components/pengajuan/hooks/use-pengajuan-cetak-arsip";
import { canCetakBeritaAcaraPengajuan, canCetakSopArsipPengajuan } from "@/lib/print/pengajuan-print";
import { usePengajuanBeritaAcaraView, usePengajuanEvaluasiDetail, usePengajuanSopDokumenWorkbench } from "@/api/evaluasi";
import { createPinConfirmHandler, useTandaTanganiSopPengajuan } from "@/api/tte";
import { mapPenyusunWorkbenchToPreviewProps } from "@/lib/sop/detailSop.mappers";
import { parseTTESignaturePayload } from "@/lib/tte/parse-tte-signature-payload";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { NotFoundWithBack } from "@/components/ui/not-found";
import { InfoCard } from "@/components/ui/info-card";
import { InfoField } from "@/components/ui/info-field";
import { PengajuanEvaluasiStatusHeader } from "@/components/evaluasi/pengajuan-evaluasi-status-header";
import {
  CollapsedStripButton,
  CollapsibleSidePanel,
  CollapsibleSidePanelContent,
  CollapsibleSidePanelHeader,
  SimplePanelHeader,
} from "@/components/ui/collapsible-side-panel";
import { BeritaAcaraPreviewPane } from "@/components/pengajuan/berita-acara-preview-pane";
import { DocumentPreviewTabs } from "@/components/pengajuan/document-preview-tabs";
import { SopDocumentPreviewPane } from "@/components/pengajuan/sop-document-preview-pane";
import { mapBeritaAcaraTemplateProps } from "@/lib/pengajuan/map-berita-acara-template-props";
import { PinVerificationDialog } from "@/components/tte/pin-verification-dialog";
import { SOPListCard } from "@/components/sop/sop-list-card";
import { ROUTES } from "@/utils/constants";
import { formatDateIdFull } from "@/utils/format-date";

const STATUS_SOP_SIAP_TTD_KEPALA_OPD = "DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI";
type PengajuanDetail = NonNullable<ReturnType<typeof usePengajuanEvaluasiDetail>["pengajuan"]>;
type PengajuanSopList = NonNullable<PengajuanDetail["sopList"]>;
const EMPTY_SOP_LIST: PengajuanSopList = [];

export function DetailPengajuanSOPPage() {
  const { id } = useParams({ from: "/kepala-opd/pengajuan/$id" });

  const { pengajuan, loading } = usePengajuanEvaluasiDetail(id);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null);
  const [previewMainTab, setPreviewMainTab] = useState<"sop" | "ba">("sop");
  const [pinDialogOpen, setPinDialogOpen] = useState(false);

  const allSopList = pengajuan?.sopList ?? EMPTY_SOP_LIST;
  const canCetakBa = canCetakBeritaAcaraPengajuan(pengajuan?.status);
  const canCetakSopArsip = canCetakSopArsipPengajuan(pengajuan?.status);
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

  const sopWorkbenchEnabled = Boolean(
    effectiveSopDetailId && (previewMainTab === "sop" || canCetakSopArsip),
  );
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

  const tteSignaturePayloadKepalaOpd = useMemo(
    () => parseTTESignaturePayload(sopDokumen?.tteSignaturePayloadKepalaOpd),
    [sopDokumen?.tteSignaturePayloadKepalaOpd],
  );

  const baViewEnabled = Boolean(pengajuan && (previewMainTab === "ba" || canCetakBa));
  const { data: baView, isFetching: baViewLoading } = usePengajuanBeritaAcaraView(id, {
    enabled: baViewEnabled,
  });

  const baTemplateProps = useMemo(
    () =>
      pengajuan != null
        ? mapBeritaAcaraTemplateProps({ pengajuan, baView })
        : null,
    [pengajuan, baView],
  );

  const { handleCetak, cetakLoading } = usePengajuanCetakArsip({
    pengajuanId: id,
    effectiveSopDetailId,
    baTemplateProps,
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
                <PengajuanCetakArsipButtons
                  printScope="pj-penyusun-kepala-opd"
                  pengajuanStatus={pengajuan.status}
                  effectiveSopDetailId={effectiveSopDetailId}
                  sopCount={allSopList.length}
                  cetakLoading={cetakLoading}
                  onCetak={handleCetak}
                />
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
              <InfoField label="Nomor BA">
                <span className="font-mono">{pengajuan.nomorBA ?? "—"}</span>
              </InfoField>
              <InfoField label="Tanggal BA Ditandatangani PJ Penyusun">
                {formatDateIdFull(pengajuan.tanggalTTDBaPjPenyusun)}
              </InfoField>
              <InfoField label="Jumlah SOP">{`${sopList.length} dokumen`}</InfoField>
            </div>
            <PengajuanEvaluasiStatusHeader
              status={pengajuan.status}
              statusLabel={pengajuan.statusLabel ?? pengajuan.status}
              role="KEPALA_OPD"
            />
            {!canSignAll && !isSudahBerlaku && (
              <InfoCard variant="warning" icon={<AlertCircle />} title="Pengajuan belum siap ditandatangani">
                Pengajuan harus berstatus ditandatangani PJ Penyusun sebelum disahkan Kepala OPD.
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
            widthCollapsed="w-10"
            widthExpanded="w-[min(300px,36vw)]"
          >
            {leftPanelCollapsed ? (
              <CollapsedStripButton
                label="SOP"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => setLeftPanelCollapsed(false)}
              />
            ) : (
              <>
                <CollapsibleSidePanelHeader
                  side="left"
                  onCollapse={() => setLeftPanelCollapsed(true)}
                  className="border-gray-100 bg-gray-50/90 px-2 py-1.5 sm:px-2.5"
                >
                  <SimplePanelHeader title="Daftar SOP" />
                </CollapsibleSidePanelHeader>
                <CollapsibleSidePanelContent className="px-2 pb-2 pt-1 sm:px-2">
                  <SOPListCard
                    items={sopList.map((item) => ({
                      id: item.sopDetailId,
                      nama: item.nama,
                      nomor: item.nomor,
                      statusDokumen: item.status,
                      statusDokumenLabel: item.statusLabel ?? item.status,
                      hasilEvaluasi: item.hasil,
                      hasilEvaluasiLabel: item.hasilLabel,
                    }))}
                    selectedId={effectiveSopDetailId}
                    onSelect={setSelectedSopId}
                  />
                </CollapsibleSidePanelContent>
              </>
            )}
          </CollapsibleSidePanel>
        }
      >
        <DocumentPreviewTabs
          value={previewMainTab}
          onValueChange={setPreviewMainTab}
          tabs={[
            {
              value: "sop",
              label: "Pratinjau SOP",
              contentClassName: "mt-3 flex min-h-0 flex-1 flex-col overflow-auto px-2 pb-2",
              content: (
                <SopDocumentPreviewPane
                  selectedSop={selectedSop}
                  isLoading={sopWorkbenchLoading}
                  sopPreviewProps={sopPreviewProps}
                  tteSignaturePayload={tteSignaturePayloadKepalaOpd ?? null}
                />
              ),
            },
            {
              value: "ba",
              label: "Pratinjau Berita Acara",
              contentClassName: "mt-2 flex min-h-0 flex-1 flex-col overflow-auto px-1 pb-1 sm:px-2",
              content:
                baTemplateProps != null ? (
                  <BeritaAcaraPreviewPane
                    isLoading={baViewLoading}
                    templateProps={baTemplateProps}
                  />
                ) : null,
            },
          ]}
        />
      </DetailPageLayout>

      <PengajuanSopPrintLayer
        previewProps={sopPreviewProps}
        tteSignaturePayload={tteSignaturePayloadKepalaOpd}
        fallbackSop={selectedSop}
      />

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
