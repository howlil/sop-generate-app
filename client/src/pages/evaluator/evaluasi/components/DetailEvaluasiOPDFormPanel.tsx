import { Activity, FileText, Building2, PanelsTopLeft } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import {
  CollapsedStripButton,
  CollapsibleSidePanel,
  CollapsibleSidePanelContent,
  CollapsibleSidePanelHeader,
  PanelTabStrip,
} from "@/components/ui/collapsible-side-panel";
import { InfoCard } from "@/components/ui/info-card";
import { RiwayatCardList } from "@/pages/evaluator/evaluasi/components/RiwayatCardList";
import { EvaluasiKeputusanSebelumnyaCard } from "@/pages/evaluator/evaluasi/components/EvaluasiKeputusanSebelumnyaCard";
import { EvaluasiSopTahapBanner } from "@/pages/evaluator/evaluasi/components/EvaluasiSopTahapBanner";
import { RiwayatNilaiEvaluasiPanel } from "@/pages/evaluator/evaluasi/components/RiwayatNilaiEvaluasiPanel";
import type { TahapPenilaianSop } from "@/lib/evaluasi/evaluasi-domain";
import { STATUS_HASIL_EVALUASI } from "@/types/dto/evaluasi.dto";
import { StatusHasilEvaluasiPicker } from "@/pages/evaluator/evaluasi/components/StatusHasilEvaluasiPicker";
import { SkorRatingPicker } from "@/pages/evaluator/evaluasi/components/SkorRatingPicker";
import type { RiwayatEvaluasiEntry } from "@/api/evaluasi";
import type { PengajuanTimelineNilaiEntry } from "@/types/dto/evaluasi.dto";
import { formatDateId } from "@/utils/format-date";
import type { StatusHasilEvaluasi } from "@/types/dto/evaluasi.dto";

export type DetailEvaluasiActiveTab = "sop" | "aktivitas" | "opd";

interface DetailEvaluasiPanelStateProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  activeFormTab: DetailEvaluasiActiveTab;
  onTabChange: (id: DetailEvaluasiActiveTab) => void;
}

interface DetailEvaluasiSopFormProps {
  effectiveSopId: string | null;
  /** true bila pengajuan sudah keluar dari tahap SEDANG_DIEVALUASI. */
  readOnly: boolean;
  tahapPenilaian: TahapPenilaianSop;
  versi?: number;
  detailUpdatedAt?: string | null;
  ditindaklanjutiPada?: string | null;
  nilaiTersimpan: { hasil: StatusHasilEvaluasi | null; catatan: string | null } | null;
  statusEvaluasi: StatusHasilEvaluasi | null;
  setStatusEvaluasi: (v: StatusHasilEvaluasi) => void;
  komentarEvaluasi: string;
  setKomentarEvaluasi: (v: string) => void;
  logNilaiEntries: PengajuanTimelineNilaiEntry[];
  isLogNilaiLoading?: boolean;
}

interface DetailEvaluasiOpdFormProps {
  opd: { id: string; nama: string; kode: string } | null;
  readOnly: boolean;
  nilaiOpdTersimpan: number | null;
  riwayatOpd: RiwayatEvaluasiEntry[];
  ratingOPD: number | null;
  setRatingOPD: (v: number | null) => void;
}

export interface DetailEvaluasiOPDFormPanelProps {
  /** false untuk pengajuan MANDIRI — tanpa tab Evaluasi OPD. */
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
          id: "aktivitas" as const,
          label: "Aktivitas",
          icon: <Activity className="w-3.5 h-3.5" />,
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
        {
          id: "aktivitas" as const,
          label: "Aktivitas",
          icon: <Activity className="w-3.5 h-3.5" />,
        },
      ];
  const activeTabResolved =
    !penilaianOpdDiizinkan && panelState.activeFormTab === "opd"
      ? "sop"
      : panelState.activeFormTab;

  return (
    <CollapsibleSidePanel
      side="right"
      collapsed={panelState.collapsed}
      widthExpanded="w-full"
    >
      {panelState.collapsed ? (
        <CollapsedStripButton
          label="Form"
          icon={<PanelsTopLeft className="w-5 h-5" />}
          onClick={() => panelState.onCollapsedChange(false)}
        />
      ) : (
        <>
          <CollapsibleSidePanelHeader
            side="right"
            onCollapse={() => panelState.onCollapsedChange(true)}
          >
            <PanelTabStrip
              tabs={formTabs}
              activeTab={activeTabResolved}
              onTabChange={(id) => {
                panelState.onTabChange(id as DetailEvaluasiActiveTab);
              }}
            />
          </CollapsibleSidePanelHeader>
          <CollapsibleSidePanelContent className="px-2 pb-2 pt-1 sm:px-2">
            <div className="p-3 space-y-4">
        {activeTabResolved === "sop" && (
          <>
            {!sopForm.effectiveSopId ? (
              <p className="text-xs text-gray-500">
                Pilih SOP di daftar kiri untuk mengisi form evaluasi.
              </p>
            ) : sopForm.readOnly ? (
              <InfoCard variant="neutral" title="Penilaian ditutup">
                <div className="space-y-1.5 text-xs text-gray-700">
                  <p>
                    <span className="text-gray-500">Status: </span>
                    <span className="font-medium">
                      {labelHasilRiwayat(sopForm.nilaiTersimpan?.hasil)}
                    </span>
                  </p>
                  {sopForm.nilaiTersimpan?.catatan ? (
                    <p className="leading-snug whitespace-pre-wrap">
                      <span className="text-gray-500">Catatan: </span>
                      {sopForm.nilaiTersimpan.catatan}
                    </p>
                  ) : null}
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Pengajuan sudah keluar dari tahap penilaian — tidak dapat
                  diubah.
                </p>
              </InfoCard>
            ) : (
              <>
                <EvaluasiSopTahapBanner
                  tahap={sopForm.tahapPenilaian}
                  versi={sopForm.versi}
                  detailUpdatedAt={sopForm.detailUpdatedAt}
                  ditindaklanjutiPada={sopForm.ditindaklanjutiPada}
                />
                {sopForm.tahapPenilaian === "tinjauan_ulang" &&
                sopForm.nilaiTersimpan?.hasil === "PERLU_PERBAIKAN" ? (
                  <EvaluasiKeputusanSebelumnyaCard
                    hasil="PERLU_PERBAIKAN"
                    catatan={sopForm.nilaiTersimpan.catatan}
                  />
                ) : null}
                <div className="space-y-3">
                  {sopForm.tahapPenilaian === "tinjauan_ulang" ? (
                    <p className="text-xs font-medium text-gray-800">
                      Penilaian ulang
                    </p>
                  ) : null}
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
                </div>
                <p className="text-[11px] text-gray-500">
                  {sopForm.tahapPenilaian === "tinjauan_ulang"
                    ? "Pilih hasil penilaian ulang — perubahan disimpan otomatis setelah Anda memilih."
                    : "Perubahan disimpan otomatis. Riwayat ada di tab Aktivitas."}
                </p>
              </>
            )}
          </>
        )}

        {activeTabResolved === "aktivitas" && (
          <>
            {!sopForm.effectiveSopId ? (
              <p className="text-xs text-gray-500">
                Pilih SOP di daftar kiri untuk melihat aktivitas penilaian.
              </p>
            ) : (
              <RiwayatNilaiEvaluasiPanel
                entries={sopForm.logNilaiEntries}
                isLoading={sopForm.isLogNilaiLoading}
              />
            )}
          </>
        )}

        {activeTabResolved === "opd" && penilaianOpdDiizinkan && (
          <>
            {!opdForm.opd ? (
              <p className="text-xs text-gray-500">OPD tidak tersedia.</p>
            ) : (
              <>
                {opdForm.readOnly ? (
                  <InfoCard variant="neutral" title="Skor evaluasi OPD">
                    <p className="text-xs text-gray-700">
                      {opdForm.nilaiOpdTersimpan != null ? (
                        <>
                          <span className="text-gray-500">Skor: </span>
                          <span className="font-semibold text-blue-700">
                            {opdForm.nilaiOpdTersimpan}/5
                          </span>
                        </>
                      ) : (
                        "Tidak ada skor OPD untuk pengajuan ini."
                      )}
                    </p>
                  </InfoCard>
                ) : (
                  <SkorRatingPicker
                    value={opdForm.ratingOPD}
                    onChange={opdForm.setRatingOPD}
                  />
                )}

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
          </CollapsibleSidePanelContent>
        </>
      )}
    </CollapsibleSidePanel>
  );
}
