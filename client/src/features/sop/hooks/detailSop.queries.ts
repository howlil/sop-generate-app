import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import { sopApi } from "../services/sop.api";
import type {
  CreateDasarHukumDto,
  CreateDetailSOPPelaksanaDto,
  CreateLampiranTeksDto,
  CreateLangkahSOPDto,
  CreateSopTerkaitDto,
  UpdateLangkahSOPDto,
  UpdateMetadataDto,
  UpdateStatusDto,
} from "../types/sop";

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
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLangkahSOPDto }) =>
      sopApi.updateLangkah(sopDetailId, id, payload),
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

export function useEditHistory(sopDetailId: string) {
  return useQuery({
    queryKey: queryKeys.detailSopLogs(sopDetailId),
    queryFn: () => sopApi.getEditHistory(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });
}
