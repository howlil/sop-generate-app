import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { CheckCircle, MessageSquare, History, Printer } from "lucide-react";
import { SOPPreviewTemplate } from "@/features/sop/components/SOPPreviewTemplate";
import { SOPListCard } from "@/features/sop";
import { formatDateId } from "@/utils/format-date";
import { PinVerificationDialog, createPinConfirmHandler } from "@/features/tte";
import { useTandaTanganiBA } from "@/features/tte/hooks/useTte";
import { usePengajuanEvaluasiDetail } from "@/features/evaluasi";
import { RiwayatEvaluasiTimeline } from "@/features/evaluasi/components/RiwayatEvaluasiTimeline";
import { ROUTES } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { NotFoundWithBack } from "@/components/ui/not-found";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";
import { CollapsibleSidePanel } from "@/components/ui/collapsible-side-panel";
import { useToast } from "@/utils/toast";
import { StatusBadge } from "@/components/ui/status-badge";
import { InfoField } from "@/components/ui/info-field";
import { BeritaAcaraTemplate } from "@/components/berita-acara/BeritaAcaraTemplate";
import { InfoCard } from "@/components/ui/info-card";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { IA } from "@/utils/constants";

const PRINT_DELAY_MS = 150;

export function DetailPengajuanEvaluasi() {
  const { id } = useParams({
    from: "/biro-organisasi/manajemen-evaluasi-sop/detail/$id",
  });
  const { showToast } = useToast();
  const { pengajuan, isVerified, canVerify } = usePengajuanEvaluasiDetail(id);
  const [previewMainTab, setPreviewMainTab] = useState<"sop" | "ba">("sop");
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"catatan" | "riwayat">(
    "catatan",
  );
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null);
  const [tteDialogOpen, setTteDialogOpen] = useState(false);

  const tandaTanganiBA = useTandaTanganiBA();

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
    () => {
      showToast(
        "Verifikasi Berita Acara (Biro) berhasil. Koordinator Tim Penyusun dapat melanjutkan verifikasi BA.",
      );
    },
  );

  const sopList = pengajuan?.sopList ?? [];
  const firstSopDetailId = sopList[0]?.sopDetailId ?? null;
  const effectiveSopDetailId = selectedSopId ?? firstSopDetailId;
  const displaySop = sopList.find(
    (s) => s.sopDetailId === effectiveSopDetailId,
  );

  useDocumentTitle(
    pengajuan
      ? `${IA.TERJADWAL_EVALUASI_OPD} — ${pengajuan.opdNama}`
      : undefined,
  );

  if (!pengajuan) {
    return (
      <NotFoundWithBack
        message="Pengajuan evaluasi tidak ditemukan."
        backAction={
          <BackButton to={ROUTES.BIRO_ORGANISASI.MANAJEMEN_EVALUASI_SOP}>
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
            to: ROUTES.BIRO_ORGANISASI.MANAJEMEN_EVALUASI_SOP,
          },
          { label: pengajuan.opdNama ?? "" },
        ]}
        title={`${IA.TERJADWAL_EVALUASI_OPD} — ${pengajuan.opdNama}`}
        description={`${IA.VERIFIKASI_BA_BIRO} pada dokumen ${IA.BERITA_ACARA}. Setelah ini: Koordinator → ${IA.PENGESAHAN_SOP} oleh Kepala OPD.`}
        backTo={ROUTES.BIRO_ORGANISASI.MANAJEMEN_EVALUASI_SOP}
        backSize="icon"
        header={
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-semibold text-gray-900">
                Informasi OPD & Evaluasi
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
              <InfoField label="OPD">{pengajuan.opdNama}</InfoField>
              <InfoField label="Jenis">{pengajuan.jenis}</InfoField>
              <InfoField label="Status">
                <StatusBadge status={pengajuan.status} />
              </InfoField>
              <InfoField label="Tanggal Evaluasi">
                {pengajuan.tanggalEvaluasi
                  ? formatDateId(pengajuan.tanggalEvaluasi)
                  : "-"}
              </InfoField>
              {pengajuan.nilaiOPD && (
                <InfoField label="Nilai OPD">
                  {pengajuan.nilaiOPD.toString()}
                </InfoField>
              )}
            </div>

            {isVerified && (
              <InfoCard
                variant="success"
                icon={<CheckCircle />}
                title="Berita Acara telah diverifikasi"
              >
                Koordinator Tim Penyusun dapat melanjutkan verifikasi. Setelah
                itu, Kepala OPD dapat mengesahkan SOP.
              </InfoCard>
            )}
          </>
        }
        leftPanel={
          <CollapsibleSidePanel
            side="left"
            collapsed={leftPanelCollapsed}
            onCollapsedChange={setLeftPanelCollapsed}
            widthExpanded="w-full"
            title="Daftar SOP"
          >
            <SOPListCard
              items={sopList.map((sop) => ({
                id: sop.sopDetailId,
                nama: sop.nama,
                nomor: sop.nomor,
                status:
                  sop.hasil === "SESUAI"
                    ? "SIAP_DIVERIFIKASI"
                    : "REVISI_DARI_TIM_EVALUASI",
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
            widthExpanded="w-full"
            title="Catatan & Riwayat"
            tabs={[
              {
                id: "catatan",
                label: "Catatan",
                icon: <MessageSquare className="w-3.5 h-3.5" />,
              },
              {
                id: "riwayat",
                label: "Riwayat",
                icon: <History className="w-3.5 h-3.5" />,
              },
            ]}
            activeTab={rightPanelTab}
            onTabChange={(id) => setRightPanelTab(id as "catatan" | "riwayat")}
          >
            {rightPanelTab === "catatan" ? (
              <div className="space-y-2 text-sm text-gray-600">
                {pengajuan.catatan ? (
                  <p className="whitespace-pre-wrap">{pengajuan.catatan}</p>
                ) : (
                  <p className="text-gray-400 italic">Tidak ada catatan</p>
                )}
              </div>
            ) : (
              <RiwayatEvaluasiTimeline
                logs={pengajuan.riwayatEvaluasi ?? []}
              />
            )}
          </CollapsibleSidePanel>
        }
      >
        {previewMainTab === "sop" && displaySop && (
          <SOPPreviewTemplate
            name={displaySop.nama}
            number={displaySop.nomor}
          />
        )}

        {previewMainTab === "ba" && pengajuan && (
          <BeritaAcaraTemplate
            opd={pengajuan.opdNama ?? ""}
            nomorBA={pengajuan.nomorBA}
            tanggalVerifikasi={pengajuan.tanggalVerifikasi}
            namaBiro={pengajuan.namaBiro}
          />
        )}
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
