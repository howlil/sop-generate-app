import { useCallback } from "react";
import type { NavigateOptions } from "@tanstack/react-router";
import { sopApi } from "../services/sop.api";
import { ROUTES } from "@/utils/constants";
import { isTempId, transformProsedurRowToCreateLangkah, transformProsedurRowToUpdateLangkah } from "./detailSop.mappers";
import type { ProsedurRow, SOPDetailMetadata } from "@/types/common";

interface UseDetailSopPenyusunActionsParams {
  metadata: SOPDetailMetadata;
  prosedurRows: ProsedurRow[];
  langkahList: Array<{ id: string }>;
  createLangkah: (payload: import("../types/sop").CreateLangkahSOPDto) => Promise<unknown>;
  updateLangkah: (args: {
    id: string;
    payload: import("../types/sop").UpdateLangkahSOPDto;
  }) => Promise<unknown>;
  updateMetadataMutation: {
    mutateAsync: (args: {
      id: string;
      payload: {
        logoInstansi?: string;
        namaLembaga?: string;
        tanggalEfektif?: string;
        tanggalRevisi?: string;
      };
    }) => Promise<unknown>;
  };
  setSopStatusOverrideAsync: (payload: {
    sopId: string;
    status: "SEDANG_DISUSUN" | "SIAP_DIEVALUASI";
  }) => Promise<unknown>;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  isRevisionFlow: boolean;
}

export function useDetailSopPenyusunActions({
  metadata,
  prosedurRows,
  langkahList,
  createLangkah,
  updateLangkah,
  updateMetadataMutation,
  setSopStatusOverrideAsync,
  showToast,
  isRevisionFlow,
}: UseDetailSopPenyusunActionsParams) {
  const persistAllChanges = useCallback(
    async (sopDetailId: string) => {
      await updateMetadataMutation.mutateAsync({
        id: sopDetailId,
        payload: {
          logoInstansi: metadata.logoUrl,
          namaLembaga: metadata.lembaga,
          tanggalEfektif: metadata.tanggalEfektif || undefined,
          tanggalRevisi: metadata.tanggalRevisi || undefined,
        },
      });

      const existingIds = new Set(langkahList?.map((item) => item.id) ?? []);
      const currentIds = new Set(prosedurRows.map((row) => row.id).filter((id) => !isTempId(id)));

      for (const row of prosedurRows) {
        if (isTempId(row.id)) {
          const dto = transformProsedurRowToCreateLangkah(row, sopDetailId);
          if (dto.kegiatan && dto.pelaksanaId) {
            await createLangkah(dto);
          }
        }
      }

      for (const row of prosedurRows) {
        if (!isTempId(row.id) && existingIds.has(row.id)) {
          const dto = transformProsedurRowToUpdateLangkah(row);
          await updateLangkah({ id: row.id, payload: dto });
        }
      }

      for (const existingId of existingIds) {
        if (!currentIds.has(existingId)) {
          await sopApi.deleteLangkah(sopDetailId, existingId);
        }
      }
    },
    [
      createLangkah,
      langkahList,
      metadata.lembaga,
      metadata.logoUrl,
      metadata.tanggalEfektif,
      metadata.tanggalRevisi,
      prosedurRows,
      updateLangkah,
      updateMetadataMutation,
    ],
  );

  const handleSaveDraft = useCallback(
    async (id: string | undefined, role: string | null) => {
      if (!id || !role) {
        showToast("ID SOP tidak tersedia", "error");
        return;
      }

      try {
        await persistAllChanges(id);
        await setSopStatusOverrideAsync({ sopId: id, status: "SEDANG_DISUSUN" });
        showToast("Draft berhasil disimpan, status diubah menjadi Sedang Disusun");
      } catch {
        showToast("Gagal menyimpan draft. Periksa data yang diisi.", "error");
      }
    },
    [persistAllChanges, setSopStatusOverrideAsync, showToast],
  );

  const handleComplete = useCallback(
    async (
      id: string | undefined,
      role: string | null,
      navigateFn?: (opts: NavigateOptions) => void,
    ) => {
      if (!id || !role) {
        showToast("ID SOP tidak tersedia", "error");
        return;
      }

      try {
        await persistAllChanges(id);
        await setSopStatusOverrideAsync({ sopId: id, status: "SIAP_DIEVALUASI" });
        showToast(
          isRevisionFlow
            ? "Revisi selesai. Kembali ke Manajemen SOP untuk kirim ulang ke evaluasi."
            : "SOP berhasil disimpan dan siap diajukan ke evaluasi.",
        );
        if (navigateFn) {
          navigateFn({ to: ROUTES.TIM_PENYUSUN.SOP });
        }
      } catch {
        showToast("Gagal menyelesaikan SOP. Periksa data yang diisi.", "error");
      }
    },
    [isRevisionFlow, persistAllChanges, setSopStatusOverrideAsync, showToast],
  );

  return {
    handleSaveDraft,
    handleComplete,
  };
}
