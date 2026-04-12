/**
 * useDetailSop hooks - TanStack Query
 * Covers: DetailSOP CRUD, LangkahSOP, Lampiran, DasarHukum, SopTerkait, Swimlane, EditHistory
 */

import { useQuery } from "@tanstack/react-query";
import { sopApi } from "@/features/sop/services/sop.api";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type {
  UpdateMetadataDto,
  UpdateStatusDto,
  CreateLangkahSOPDto,
  UpdateLangkahSOPDto,
  CreateLampiranTeksDto,
  CreateDasarHukumDto,
  CreateSopTerkaitDto,
  CreateDetailSOPPelaksanaDto,
  SopDetail,
  LangkahSOP,
} from "@/features/sop/types/sop";
import type { SOPDetailMetadata, PelaksanaRow } from "@/types/common";

// ================= Transformation Functions =================

/** Transform API SopDetail → UI SOPDetailMetadata */
export function transformSopDetailToMetadata(detail: SopDetail): SOPDetailMetadata {
  return {
    id: detail.id,
    nomorSOP: detail.nomorSOP,
    nama: detail.sop?.judul ?? "",
    judul: detail.sop?.judul,
    lembaga: detail.namaLembaga,
    logoUrl: detail.logoInstansi,
    tanggalEfektif: detail.tanggalEfektif ?? "",
    tanggalRevisi: detail.tanggalRevisi ?? "",
    version: detail.versi,
  };
}

/** Transform API LangkahSOP → UI ProsedurRow */
export function transformLangkahToProsedurRow(langkah: LangkahSOP): import("@/types/common").ProsedurRow {
  return {
    id: langkah.id,
    urutan: langkah.urutan,
    no: langkah.urutan,
    kegiatan: langkah.kegiatan,
    pelaksana: langkah.pelaksanaId,
    waktu: langkah.waktu,
    satuanWaktu: langkah.satuanWaktu,
    kelengkapan: langkah.kelengkapan,
    mutu_kelengkapan: langkah.kelengkapan,
    keluaran: langkah.keluaran,
    output: langkah.keluaran,
    type: langkah.jenis?.toLowerCase() as "terminator" | "task" | "decision",
    id_next_step_if_yes: langkah.langkahSelanjutnyaYaId ?? undefined,
    id_next_step_if_no: langkah.langkahSelanjutnyaTidakId ?? undefined,
    keterangan: langkah.keterangan ?? "",
    pelaksanaMapping: {},
  };
}

/** Transform UI ProsedurRow → API CreateLangkahSOPDto */
export function transformProsedurRowToCreateLangkah(
  row: import("@/types/common").ProsedurRow,
  _sopDetailId: string,
): import("@/features/sop/types/sop").CreateLangkahSOPDto {
  // Parse waktu from mutu_waktu (e.g. "30 Menit" → { waktu: 30, satuanWaktu: "m" })
  const { waktu, satuanWaktu } = parseMutuWaktu(row.mutu_waktu);

  return {
    kegiatan: row.kegiatan,
    pelaksanaId: row.pelaksana,
    keluaran: row.keluaran ?? row.output ?? "",
    jenis: (row.type?.toUpperCase() as import("@/types/common").JenisLangkahProsedur) ?? "TASK",
    kelengkapan: row.kelengkapan ?? row.mutu_kelengkapan ?? "",
    waktu,
    satuanWaktu: satuanWaktu as import("@/types/common").SatuanWaktu,
    urutan: row.urutan,
    langkahSelanjutnyaYaId: row.id_next_step_if_yes,
    langkahSelanjutnyaTidakId: row.id_next_step_if_no,
    keterangan: row.keterangan,
  };
}

/** Transform UI ProsedurRow → API UpdateLangkahSOPDto */
export function transformProsedurRowToUpdateLangkah(
  row: import("@/types/common").ProsedurRow,
): import("@/features/sop/types/sop").UpdateLangkahSOPDto {
  const { waktu, satuanWaktu } = parseMutuWaktu(row.mutu_waktu);

  return {
    kegiatan: row.kegiatan,
    pelaksanaId: row.pelaksana,
    keluaran: row.keluaran ?? row.output,
    jenis: row.type?.toUpperCase() as import("@/types/common").JenisLangkahProsedur,
    kelengkapan: row.kelengkapan ?? row.mutu_kelengkapan,
    waktu,
    satuanWaktu: satuanWaktu as import("@/types/common").SatuanWaktu,
    urutan: row.urutan,
    langkahSelanjutnyaYaId: row.id_next_step_if_yes,
    langkahSelanjutnyaTidakId: row.id_next_step_if_no,
    keterangan: row.keterangan,
  };
}

/** Parse mutu_waktu string (e.g. "30 Menit") → { waktu, satuanWaktu } */
function parseMutuWaktu(mutuWaktu?: string): { waktu: number; satuanWaktu: string } {
  if (!mutuWaktu) return { waktu: 0, satuanWaktu: "m" };

  const unitMap: Record<string, string> = {
    menit: "m", jam: "h", hari: "d", minggu: "w", bulan: "mo", tahun: "y",
    Menit: "m", Jam: "h", Hari: "d", Minggu: "w", Bulan: "mo", Tahun: "y",
  };

  const match = mutuWaktu.match(/^(\d+)\s+(\w+)$/);
  if (match) {
    const waktu = parseInt(match[1], 10);
    const satuanWaktu = unitMap[match[2]] ?? "m";
    return { waktu: isNaN(waktu) ? 0 : waktu, satuanWaktu };
  }

  // Fallback: try parsing as plain number
  const num = parseInt(mutuWaktu, 10);
  return { waktu: isNaN(num) ? 0 : num, satuanWaktu: "m" };
}

/** Check if an ID is a temporary (client-generated) ID */
export function isTempId(id: string): boolean {
  return id.startsWith("temp-");
}

// ================= Initial State Helpers =================
export function getInitialSopDetailMetadata(): SOPDetailMetadata {
  return {
    id: "",
    nomorSOP: "",
    nama: "",
    lembaga: "",
    logoUrl: "",
    tanggalEfektif: "",
    tanggalRevisi: "",
  };
}

export function getInitialSopDetailImplementers(): PelaksanaRow[] {
  return [];
}

// ================= DetailSOP =================

export function useDetailSopList(params?: {
  sopId?: string;
  opdId?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: queryKeys.detailSopList(params),
    queryFn: () => sopApi.findDetailAll(params),
    staleTime: STALE_TIME.SHORT,
  });
}

export function useDetailSopById(id: string) {
  return useQuery({
    queryKey: queryKeys.detailSopById(id),
    queryFn: () => sopApi.findDetailById(id),
    enabled: !!id,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useUpdateMetadata() {
  return useMutationWithToast({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMetadataDto }) =>
      sopApi.updateMetadata(id, payload),
    invalidateKeys: [queryKeys.detailSop],
    successMessage: "Metadata SOP berhasil diperbarui",
    errorMessagePrefix: "Gagal memperbarui metadata",
  });
}

export function useUpdateStatus() {
  return useMutationWithToast({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStatusDto }) =>
      sopApi.updateStatus(id, payload),
    invalidateKeys: [queryKeys.detailSop, queryKeys.sop],
    successMessage: "Status SOP berhasil diubah",
    errorMessagePrefix: "Gagal mengubah status",
  });
}

// ================= LangkahSOP =================

export function useLangkahSop(sopDetailId: string) {
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.langkahSopByDetail(sopDetailId),
    queryFn: () => sopApi.findLangkah(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreateLangkahSOPDto) =>
      sopApi.createLangkah(sopDetailId, payload),
    invalidateKeys: [queryKeys.langkahSopByDetail(sopDetailId)],
    successMessage: "Langkah berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambah langkah",
  });

  const updateMutation = useMutationWithToast({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateLangkahSOPDto;
    }) => sopApi.updateLangkah(sopDetailId, id, payload),
    invalidateKeys: [queryKeys.langkahSopByDetail(sopDetailId)],
    successMessage: "Langkah berhasil diperbarui",
    errorMessagePrefix: "Gagal memperbarui langkah",
  });

  const deleteMutation = useMutationWithToast({
    mutationFn: (id: string) => sopApi.deleteLangkah(sopDetailId, id),
    invalidateKeys: [queryKeys.langkahSopByDetail(sopDetailId)],
    successMessage: "Langkah berhasil dihapus",
    errorMessagePrefix: "Gagal menghapus langkah",
  });

  return {
    list,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
  };
}

// ================= Swimlane =================

export function useSwimlane(sopDetailId: string) {
  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.swimlane(sopDetailId),
    queryFn: () => sopApi.getSwimlane(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });

  const addMutation = useMutationWithToast({
    mutationFn: (payload: CreateDetailSOPPelaksanaDto) =>
      sopApi.addSwimlane(sopDetailId, payload),
    invalidateKeys: [queryKeys.swimlane(sopDetailId)],
    successMessage: "Pelaksana berhasil ditambahkan ke swimlane",
    errorMessagePrefix: "Gagal menambah pelaksana ke swimlane",
  });

  const removeMutation = useMutationWithToast({
    mutationFn: (pelaksanaId: string) =>
      sopApi.removeSwimlane(sopDetailId, pelaksanaId),
    invalidateKeys: [queryKeys.swimlane(sopDetailId)],
    successMessage: "Pelaksana berhasil dihapus dari swimlane",
    errorMessagePrefix: "Gagal menghapus pelaksana dari swimlane",
  });

  return {
    list,
    isLoading,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  };
}

// ================= LampiranTeks =================

export function useLampiran(sopDetailId: string, jenis?: string) {
  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.lampiran(sopDetailId),
    queryFn: () => sopApi.findLampiran(sopDetailId, jenis),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreateLampiranTeksDto) =>
      sopApi.createLampiran(sopDetailId, payload),
    invalidateKeys: [queryKeys.lampiran(sopDetailId)],
    successMessage: "Lampiran berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambah lampiran",
  });

  const updateMutation = useMutationWithToast({
    mutationFn: ({ lampiranId, teks }: { lampiranId: string; teks: string }) =>
      sopApi.updateLampiran(sopDetailId, lampiranId, teks),
    invalidateKeys: [queryKeys.lampiran(sopDetailId)],
    successMessage: "Lampiran berhasil diperbarui",
    errorMessagePrefix: "Gagal memperbarui lampiran",
  });

  const deleteMutation = useMutationWithToast({
    mutationFn: (lampiranId: string) =>
      sopApi.deleteLampiran(sopDetailId, lampiranId),
    invalidateKeys: [queryKeys.lampiran(sopDetailId)],
    successMessage: "Lampiran berhasil dihapus",
    errorMessagePrefix: "Gagal menghapus lampiran",
  });

  return {
    list,
    isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
  };
}

// ================= DasarHukum =================

export function useDasarHukum(sopDetailId: string) {
  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.dasarHukum(sopDetailId),
    queryFn: () => sopApi.getDasarHukum(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });

  const addMutation = useMutationWithToast({
    mutationFn: (payload: CreateDasarHukumDto) =>
      sopApi.addDasarHukum(sopDetailId, payload),
    invalidateKeys: [queryKeys.dasarHukum(sopDetailId)],
    successMessage: "Dasar hukum berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambah dasar hukum",
  });

  const removeMutation = useMutationWithToast({
    mutationFn: (peraturanId: string) =>
      sopApi.removeDasarHukum(sopDetailId, peraturanId),
    invalidateKeys: [queryKeys.dasarHukum(sopDetailId)],
    successMessage: "Dasar hukum berhasil dihapus",
    errorMessagePrefix: "Gagal menghapus dasar hukum",
  });

  return {
    list,
    isLoading,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  };
}

// ================= SopTerkait =================

export function useSopTerkait(sopDetailId: string) {
  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.sopTerkait(sopDetailId),
    queryFn: () => sopApi.getSopTerkait(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });

  const addMutation = useMutationWithToast({
    mutationFn: (payload: CreateSopTerkaitDto) =>
      sopApi.addSopTerkait(sopDetailId, payload),
    invalidateKeys: [queryKeys.sopTerkait(sopDetailId)],
    successMessage: "SOP terkait berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambah SOP terkait",
  });

  const removeMutation = useMutationWithToast({
    mutationFn: (terkaitId: string) =>
      sopApi.removeSopTerkait(sopDetailId, terkaitId),
    invalidateKeys: [queryKeys.sopTerkait(sopDetailId)],
    successMessage: "SOP terkait berhasil dihapus",
    errorMessagePrefix: "Gagal menghapus SOP terkait",
  });

  return {
    list,
    isLoading,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  };
}

// ================= Edit History =================

export function useEditHistory(sopDetailId: string) {
  return useQuery({
    queryKey: queryKeys.detailSopLogs(sopDetailId),
    queryFn: () => sopApi.getEditHistory(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });
}
