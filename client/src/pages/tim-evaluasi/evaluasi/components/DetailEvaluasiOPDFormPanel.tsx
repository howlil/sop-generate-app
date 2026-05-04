import { FileText, Building2, MessageSquare } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { CollapsibleSidePanel } from "@/components/ui/collapsible-side-panel";
import { RiwayatCardList } from "@/pages/tim-evaluasi/evaluasi/components/RiwayatCardList";
import { StatusHasilEvaluasiPicker } from "@/pages/tim-evaluasi/evaluasi/components/StatusHasilEvaluasiPicker";
import { SkorRatingPicker } from "@/pages/tim-evaluasi/evaluasi/components/SkorRatingPicker";
import { KomentarPanel } from "@/pages/penyusun/sop/components/KomentarPanel";
import { useCreateSopKomentar, useSopKomentar } from "@/api/sop";
import { formatDateId } from "@/utils/format-date";
import type { NilaiEvaluasi, PengajuanEvaluasi } from "@/types/dto/evaluasi.dto";
import type { StatusHasilEvaluasi } from "@/types/dto/evaluasi.dto";

export type DetailEvaluasiActiveTab = "sop" | "opd" | "komentar";

interface DetailEvaluasiPanelStateProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  activeFormTab: DetailEvaluasiActiveTab;
  onTabChange: (id: DetailEvaluasiActiveTab) => void;
}

interface DetailEvaluasiSopFormProps {
  effectiveSopId: string | null;
  lastEvaluatedBy: Record<string, { date: string; evaluatorName: string }>;
  statusEvaluasi: StatusHasilEvaluasi | null;
  setStatusEvaluasi: (v: StatusHasilEvaluasi) => void;
  komentarEvaluasi: string;
  setKomentarEvaluasi: (v: string) => void;
  riwayatSop: NilaiEvaluasi[];
}

interface DetailEvaluasiOpdFormProps {
  opd: { id: string; nama: string; kode: string } | null;
  riwayatOpd: PengajuanEvaluasi[];
  ratingOPD: number | null;
  setRatingOPD: (v: number | null) => void;
}

export interface DetailEvaluasiOPDFormPanelProps {
  panelState: DetailEvaluasiPanelStateProps;
  sopForm: DetailEvaluasiSopFormProps;
  opdForm: DetailEvaluasiOpdFormProps;
}

export function DetailEvaluasiOPDFormPanel({
  panelState,
  sopForm,
  opdForm,
}: DetailEvaluasiOPDFormPanelProps) {
  return (
    <CollapsibleSidePanel
      side="right"
      collapsed={panelState.collapsed}
      onCollapsedChange={panelState.onCollapsedChange}
      widthExpanded="w-full"
      tabs={[
        {
          id: "sop",
          label: "Evaluasi SOP",
          icon: <FileText className="w-3.5 h-3.5" />,
        },
        {
          id: "opd",
          label: "Evaluasi OPD",
          icon: <Building2 className="w-3.5 h-3.5" />,
        },
        {
          id: "komentar",
          label: "Komentar",
          icon: <MessageSquare className="w-3.5 h-3.5" />,
        },
      ]}
      activeTab={panelState.activeFormTab}
      onTabChange={(id) => panelState.onTabChange(id as DetailEvaluasiActiveTab)}
      collapseButtonLabel="Form"
      collapseButtonIcon={<MessageSquare className="w-5 h-5" />}
    >
      <div className="p-3 space-y-4">
        {panelState.activeFormTab === "sop" && (
          <>
            {!sopForm.effectiveSopId ? (
              <p className="text-xs text-gray-500">
                Pilih SOP di daftar kiri untuk mengisi form evaluasi atau
                melihat riwayat.
              </p>
            ) : (
              <>
                {!sopForm.lastEvaluatedBy[sopForm.effectiveSopId] && (
                  <>
                    <StatusHasilEvaluasiPicker
                      value={sopForm.statusEvaluasi}
                      onChange={sopForm.setStatusEvaluasi}
                      komentarTrim={sopForm.komentarEvaluasi?.trim() ?? ""}
                    />
                    <FormField label="Komentar Evaluasi">
                      <Textarea
                        className="text-xs min-h-[80px]"
                        placeholder="Komentar evaluasi (wajib jika Perlu Perbaikan)..."
                        value={sopForm.komentarEvaluasi}
                        onChange={(e) => sopForm.setKomentarEvaluasi(e.target.value)}
                      />
                    </FormField>
                  </>
                )}

                {sopForm.lastEvaluatedBy[sopForm.effectiveSopId] && (
                  <p className="text-[11px] text-gray-500">
                    Evaluasi SOP ini sudah selesai. Riwayat di bawah.
                  </p>
                )}

                <div className="border-t border-gray-100 pt-3">
                  <RiwayatCardList
                    title="Riwayat evaluasi SOP ini"
                    emptyMessage="Belum ada riwayat evaluasi."
                    items={sopForm.riwayatSop}
                    renderItem={(r) => (
                      <>
                        <div className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className="font-medium text-gray-700">
                            {formatDateId(r.createdAt)}
                          </span>
                          <span className="text-gray-500">—</span>
                          <span className="text-gray-600">
                            {r.dinilaiOleh?.nama ?? ""}
                          </span>
                          <span
                            className={
                              r.hasil === "SESUAI"
                                ? "text-green-600 font-medium"
                                : "text-amber-600 font-medium"
                            }
                          >
                            · {r.hasil}
                          </span>
                        </div>
                        {r.catatan && (
                          <p className="text-gray-600 mt-1 leading-snug">
                            {r.catatan}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>
              </>
            )}
          </>
        )}

        {panelState.activeFormTab === "komentar" && (
          <KomentarTabContent detailSopId={sopForm.effectiveSopId} />
        )}

        {panelState.activeFormTab === "opd" && (
          <>
            {!opdForm.opd ? (
              <p className="text-xs text-gray-500">OPD tidak tersedia.</p>
            ) : (
              <>
                <SkorRatingPicker value={opdForm.ratingOPD} onChange={opdForm.setRatingOPD} />

                <div className="border-t border-gray-100 pt-3">
                  <RiwayatCardList
                    title="Riwayat evaluasi OPD"
                    emptyMessage="Belum ada riwayat evaluasi OPD."
                    items={opdForm.riwayatOpd}
                    renderItem={(r) => (
                      <>
                        <div className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className="font-medium text-gray-700">
                            {formatDateId(r.tanggalEvaluasi ?? r.createdAt)}
                          </span>
                          <span className="text-gray-500">—</span>
                          <span className="text-gray-600">
                            {r.opdNama ?? ""}
                          </span>
                          {r.nilaiOPD != null && (
                            <span className="text-blue-600 font-medium">
                              Skor {r.nilaiOPD}/5
                            </span>
                          )}
                        </div>
                        {r.catatan && (
                          <p
                            className="text-gray-600 mt-1 leading-snug truncate"
                            title={r.catatan}
                          >
                            {r.catatan}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </CollapsibleSidePanel>
  );
}

interface KomentarTabContentProps {
  detailSopId: string | null;
}

function KomentarTabContent({ detailSopId }: KomentarTabContentProps) {
  const id = detailSopId ?? "";
  const { data, isLoading } = useSopKomentar(id);
  const createMutation = useCreateSopKomentar(id);

  if (!detailSopId) {
    return (
      <p className="text-xs text-gray-500">
        Pilih SOP di daftar kiri untuk melihat dan menambahkan komentar.
      </p>
    );
  }

  return (
    <KomentarPanel
      comments={data ?? []}
      isLoading={isLoading}
      avatarVariant="orange"
      summary="Tulis komentar untuk SOP ini. Komentar dibaca oleh Penyusun, dan dapat ditandai selesai bila sudah ditindak lanjuti."
      composer={{
        canPost: true,
        isSubmitting: createMutation.isPending,
        onSubmit: async (isi) => {
          await createMutation.mutateAsync({ isi });
        },
      }}
    />
  );
}
