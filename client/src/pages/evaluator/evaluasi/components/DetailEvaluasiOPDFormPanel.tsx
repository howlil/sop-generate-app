import { FileText, Building2, PanelsTopLeft } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { CollapsibleSidePanel } from "@/components/ui/collapsible-side-panel";
import { RiwayatCardList } from "@/pages/evaluator/evaluasi/components/RiwayatCardList";
import { StatusHasilEvaluasiPicker } from "@/pages/evaluator/evaluasi/components/StatusHasilEvaluasiPicker";
import { SkorRatingPicker } from "@/pages/evaluator/evaluasi/components/SkorRatingPicker";
import type { RiwayatEvaluasiEntry } from "@/api/evaluasi";
import { formatDateId } from "@/utils/format-date";
import type { StatusHasilEvaluasi } from "@/types/dto/evaluasi.dto";
import { STATUS_HASIL_EVALUASI } from "@/types/dto/evaluasi.dto";

export type DetailEvaluasiActiveTab = "sop" | "opd";

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
  riwayatSop: RiwayatEvaluasiEntry[];
}

interface DetailEvaluasiOpdFormProps {
  opd: { id: string; nama: string; kode: string } | null;
  riwayatOpd: RiwayatEvaluasiEntry[];
  ratingOPD: number | null;
  setRatingOPD: (v: number | null) => void;
}

export interface DetailEvaluasiOPDFormPanelProps {
  /** false untuk pengajuan MANDIRI — hanya tab Evaluasi SOP. */
  penilaianOpdDiizinkan?: boolean;
  panelState: DetailEvaluasiPanelStateProps;
  sopForm: DetailEvaluasiSopFormProps;
  opdForm: DetailEvaluasiOpdFormProps;
}

function labelHasilRiwayat(hasil: string | null | undefined): string {
  if (hasil === "SESUAI") return "Sesuai";
  if (hasil === "PERLU_PERBAIKAN") return "Perlu Perbaikan";
  return hasil ?? "—";
}

export function DetailEvaluasiOPDFormPanel({
  penilaianOpdDiizinkan = true,
  panelState,
  sopForm,
  opdForm,
}: DetailEvaluasiOPDFormPanelProps) {
  const formTabs = penilaianOpdDiizinkan
    ? [
        {
          id: "sop" as const,
          label: "Evaluasi SOP",
          icon: <FileText className="w-3.5 h-3.5" />,
        },
        {
          id: "opd" as const,
          label: "Evaluasi OPD",
          icon: <Building2 className="w-3.5 h-3.5" />,
        },
      ]
    : [
        {
          id: "sop" as const,
          label: "Evaluasi SOP",
          icon: <FileText className="w-3.5 h-3.5" />,
        },
      ];
  const activeTabResolved = penilaianOpdDiizinkan
    ? panelState.activeFormTab
    : "sop";
  return (
    <CollapsibleSidePanel
      side="right"
      collapsed={panelState.collapsed}
      onCollapsedChange={panelState.onCollapsedChange}
      widthExpanded="w-full"
      tabs={formTabs}
      activeTab={activeTabResolved}
      onTabChange={(id) => {
        if (!penilaianOpdDiizinkan) return;
        panelState.onTabChange(id as DetailEvaluasiActiveTab);
      }}
      collapseButtonLabel="Form"
      collapseButtonIcon={<PanelsTopLeft className="w-5 h-5" />}
    >
      <div className="p-3 space-y-4">
        {activeTabResolved === "sop" && (
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
                      onChange={(v) => {
                        sopForm.setStatusEvaluasi(v);
                        if (v === STATUS_HASIL_EVALUASI.SESUAI) {
                          sopForm.setKomentarEvaluasi("");
                        }
                      }}
                      komentarTrim={sopForm.komentarEvaluasi?.trim() ?? ""}
                    />
                    {sopForm.statusEvaluasi ===
                      STATUS_HASIL_EVALUASI.PERLU_PERBAIKAN && (
                      <FormField label="Catatan hasil evaluasi (formal)">
                        <Textarea
                          className="text-xs min-h-[80px]"
                          placeholder="Catatan untuk penyusun — wajib jika hasil Perlu Perbaikan; tersimpan sebagai catatan nilai evaluasi dan muncul sebagai umpan balik di panel penyusun."
                          value={sopForm.komentarEvaluasi}
                          onChange={(e) =>
                            sopForm.setKomentarEvaluasi(e.target.value)
                          }
                        />
                      </FormField>
                    )}
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
                            {formatDateId(r.tanggal)}
                          </span>
                          <span className="text-gray-500">—</span>
                          <span className="text-gray-600">
                            {r.evaluator}
                          </span>
                          <span
                            className={
                              r.hasil === "SESUAI"
                                ? "text-green-600 font-medium"
                                : "text-amber-600 font-medium"
                            }
                          >
                            · {labelHasilRiwayat(r.hasil)}
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

        {activeTabResolved === "opd" && penilaianOpdDiizinkan && (
          <>
            {!opdForm.opd ? (
              <p className="text-xs text-gray-500">OPD tidak tersedia.</p>
            ) : (
              <>
                <SkorRatingPicker
                  value={opdForm.ratingOPD}
                  onChange={opdForm.setRatingOPD}
                />

                <div className="border-t border-gray-100 pt-3">
                  <RiwayatCardList
                    title="Riwayat evaluasi OPD"
                    emptyMessage="Belum ada riwayat evaluasi OPD."
                    items={opdForm.riwayatOpd}
                    renderItem={(r) => (
                      <>
                        <div className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className="font-medium text-gray-700">
                            {formatDateId(r.tanggal)}
                          </span>
                          <span className="text-gray-500">—</span>
                          <span className="text-gray-600">
                            {r.evaluator}
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
