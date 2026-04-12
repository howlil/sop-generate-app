/**
 * useEvaluasiSopByOpd hook - Fetch SOPs for evaluation by OPD
 */

import { useMemo } from "react";
import { useDetailSopList } from "@/features/sop/hooks/useDetailSop";
import { useEvaluasi } from "@/features/evaluasi";
import type { StatusSOP } from "@/types/common";
import type { SopDetail } from "@/features/sop/types/sop";

/** Status that indicate SOP is in evaluation workflow (server enum values) */
const EVALUASI_STATUS: StatusSOP[] = [
  "DIAJUKAN_EVALUASI",
  "SEDANG_DIEVALUASI",
  "SIAP_DIVERIFIKASI",
  "REVISI_DARI_TIM_EVALUASI",
];

/**
 * Hook to fetch SOPs that need evaluation for a specific OPD.
 * Combines detail SOP list with evaluation pengajuan data.
 */
export function useEvaluasiSopByOpd(opdId: string) {
  const { data: sopDetails = [], isLoading: isLoadingSop } = useDetailSopList({
    opdId,
  });
  const { list: pengajuanList = [], isLoading: isLoadingEvaluasi } =
    useEvaluasi();

  /** Find pengajuan that matches this OPD */
  const pengajuanOpd = useMemo(() => {
    return pengajuanList.find((p) => p.opdId === opdId);
  }, [pengajuanList, opdId]);

  /** Filter SOPs that are in evaluation workflow */
  const sopList = useMemo(() => {
    return (sopDetails as SopDetail[]).filter((sop: SopDetail) =>
      EVALUASI_STATUS.includes(sop.status),
    );
  }, [sopDetails]);

  return {
    sopList,
    pengajuan: pengajuanOpd ?? null,
    isLoading: isLoadingSop || isLoadingEvaluasi,
  };
}

/**
 * Interface for evaluation history entry
 */
export interface RiwayatEvaluasiEntry {
  tanggal: string;
  evaluator: string;
  hasil?: string;
  catatan?: string;
  nilaiOPD?: number;
}

/**
 * Hook to fetch evaluation history for a specific SOP.
 * Uses existing evaluasiApi.findAll to find completed evaluations.
 */
export function useRiwayatEvaluasiSop(sopDetailId: string): {
  data: RiwayatEvaluasiEntry[];
  isLoading: boolean;
} {
  const { list: pengajuanList, isLoading } = useEvaluasi({
    status: "SELESAI_DIEVALUASI",
  });

  const riwayat = useMemo(() => {
    if (!pengajuanList) return [];
    const entries: RiwayatEvaluasiEntry[] = [];
    for (const p of pengajuanList) {
      if (p.nilaiEvaluasi?.some((n) => n.sopDetailId === sopDetailId)) {
        const nilai = p.nilaiEvaluasi.find(
          (n) => n.sopDetailId === sopDetailId,
        );
        entries.push({
          tanggal: p.tanggalDiselesaikan ?? p.updatedAt,
          evaluator: p.diselesaikanOleh?.nama ?? "Unknown",
          hasil: nilai?.hasil ?? "SESUAI",
          catatan: nilai?.catatan ?? "",
        });
      }
    }
    return entries.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [pengajuanList, sopDetailId]);

  return { data: riwayat, isLoading };
}

/**
 * Hook to fetch evaluation history for a specific OPD.
 * Uses existing evaluasiApi.findAll to find completed evaluations for the OPD.
 */
export function useRiwayatEvaluasiOpd(opdId: string): {
  data: RiwayatEvaluasiEntry[];
  isLoading: boolean;
} {
  const { list: pengajuanList, isLoading } = useEvaluasi({
    opdId,
    status: "SELESAI_DIEVALUASI",
  });

  const riwayat = useMemo(() => {
    if (!pengajuanList) return [];
    return pengajuanList
      .map((p) => ({
        id: p.id,
        tanggal: p.tanggalDiselesaikan ?? p.updatedAt,
        evaluator: p.diselesaikanOleh?.nama ?? "Unknown",
        hasil: "SESUAI" as const,
        catatan: p.catatan ?? "",
      }))
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [pengajuanList]);

  return { data: riwayat, isLoading };
}
