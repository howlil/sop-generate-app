/**
 * useDetailSop hooks - TanStack Query
 * Covers: DetailSOP CRUD, LangkahSOP, Lampiran, DasarHukum, SopTerkait, Swimlane, EditHistory
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sopApi } from '@/services/sop.api'
import { queryKeys } from '@/utils/query-keys'
import { withMutationToast } from '@/utils/handleApi'
import type {
  UpdateMetadataDto,
  UpdateStatusDto,
  CreateLangkahSOPDto,
  UpdateLangkahSOPDto,
  CreateLampiranTeksDto,
  CreateDasarHukumDto,
  CreateSopTerkaitDto,
  CreateDetailSOPPelaksanaDto,
  SOPDetailMetadata,
  ProsedurRow,
  PelaksanaRow,
  KomentarItem,
  VersionHistoryItem,
} from '@/types/sop'

const DETAIL_SOP_STALE_TIME = 2 * 60 * 1000 // 2 minutes

// ================= Initial State Helpers =================
export function getInitialSopDetailMetadata(): SOPDetailMetadata {
  return {
    id: '',
    nomorSOP: '',
    nama: '',
    lembaga: '',
    logoUrl: '',
    tanggalEfektif: '',
    tanggalRevisi: '',
  }
}

export function getInitialSopDetailProsedurRows(): ProsedurRow[] {
  return []
}

export function getInitialSopDetailImplementers(): PelaksanaRow[] {
  return []
}

export function getInitialSopDetailKomentar(): KomentarItem[] {
  return []
}

export function getInitialSopDetailVersions(): VersionHistoryItem[] {
  return []
}

// ================= DetailSOP =================

export function useDetailSopList(params?: { sopId?: string; opdId?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.detailSopList(params),
    queryFn: () => sopApi.findDetailAll(params),
    staleTime: DETAIL_SOP_STALE_TIME,
  })
}

export function useDetailSopById(id: string) {
  return useQuery({
    queryKey: queryKeys.detailSopById(id),
    queryFn: () => sopApi.findDetailById(id),
    enabled: !!id,
    staleTime: DETAIL_SOP_STALE_TIME,
  })
}

export function useUpdateMetadata() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMetadataDto }) =>
      sopApi.updateMetadata(id, payload),
    ...withMutationToast('Metadata SOP berhasil diperbarui', 'Gagal memperbarui metadata'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detailSop })
    },
  })
}

export function useUpdateStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStatusDto }) =>
      sopApi.updateStatus(id, payload),
    ...withMutationToast('Status SOP berhasil diubah', 'Gagal mengubah status'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detailSop })
      queryClient.invalidateQueries({ queryKey: queryKeys.sop })
    },
  })
}

// ================= LangkahSOP =================

export function useLangkahSop(sopDetailId: string) {
  const queryClient = useQueryClient()

  const { data: list = [], isLoading, error } = useQuery({
    queryKey: queryKeys.langkahSopByDetail(sopDetailId),
    queryFn: () => sopApi.findLangkah(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: DETAIL_SOP_STALE_TIME,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateLangkahSOPDto) => sopApi.createLangkah(sopDetailId, payload),
    ...withMutationToast('Langkah berhasil ditambahkan', 'Gagal menambah langkah'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.langkahSopByDetail(sopDetailId) })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLangkahSOPDto }) =>
      sopApi.updateLangkah(sopDetailId, id, payload),
    ...withMutationToast('Langkah berhasil diperbarui', 'Gagal memperbarui langkah'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.langkahSopByDetail(sopDetailId) })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sopApi.deleteLangkah(sopDetailId, id),
    ...withMutationToast('Langkah berhasil dihapus', 'Gagal menghapus langkah'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.langkahSopByDetail(sopDetailId) })
    },
  })

  return {
    list,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
  }
}

// ================= Swimlane =================

export function useSwimlane(sopDetailId: string) {
  const queryClient = useQueryClient()

  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.swimlane(sopDetailId),
    queryFn: () => sopApi.getSwimlane(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: DETAIL_SOP_STALE_TIME,
  })

  const addMutation = useMutation({
    mutationFn: (payload: CreateDetailSOPPelaksanaDto) => sopApi.addSwimlane(sopDetailId, payload),
    ...withMutationToast('', 'Gagal menambah pelaksana ke swimlane'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swimlane(sopDetailId) })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (pelaksanaId: string) => sopApi.removeSwimlane(sopDetailId, pelaksanaId),
    ...withMutationToast('', 'Gagal menghapus pelaksana dari swimlane'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swimlane(sopDetailId) })
    },
  })

  return {
    list,
    isLoading,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  }
}

// ================= LampiranTeks =================

export function useLampiran(sopDetailId: string, jenis?: string) {
  const queryClient = useQueryClient()

  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.lampiran(sopDetailId),
    queryFn: () => sopApi.findLampiran(sopDetailId, jenis),
    enabled: !!sopDetailId,
    staleTime: DETAIL_SOP_STALE_TIME,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateLampiranTeksDto) => sopApi.createLampiran(sopDetailId, payload),
    ...withMutationToast('Lampiran berhasil ditambahkan', 'Gagal menambah lampiran'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lampiran(sopDetailId) })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ lampiranId, teks }: { lampiranId: string; teks: string }) =>
      sopApi.updateLampiran(sopDetailId, lampiranId, teks),
    ...withMutationToast('Lampiran berhasil diperbarui', 'Gagal memperbarui lampiran'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lampiran(sopDetailId) })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (lampiranId: string) => sopApi.deleteLampiran(sopDetailId, lampiranId),
    ...withMutationToast('Lampiran berhasil dihapus', 'Gagal menghapus lampiran'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lampiran(sopDetailId) })
    },
  })

  return {
    list,
    isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
  }
}

// ================= DasarHukum =================

export function useDasarHukum(sopDetailId: string) {
  const queryClient = useQueryClient()

  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.dasarHukum(sopDetailId),
    queryFn: () => sopApi.getDasarHukum(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: DETAIL_SOP_STALE_TIME,
  })

  const addMutation = useMutation({
    mutationFn: (payload: CreateDasarHukumDto) => sopApi.addDasarHukum(sopDetailId, payload),
    ...withMutationToast('Dasar hukum berhasil ditambahkan', 'Gagal menambah dasar hukum'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dasarHukum(sopDetailId) })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (peraturanId: string) => sopApi.removeDasarHukum(sopDetailId, peraturanId),
    ...withMutationToast('Dasar hukum berhasil dihapus', 'Gagal menghapus dasar hukum'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dasarHukum(sopDetailId) })
    },
  })

  return {
    list,
    isLoading,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  }
}

// ================= SopTerkait =================

export function useSopTerkait(sopDetailId: string) {
  const queryClient = useQueryClient()

  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.sopTerkait(sopDetailId),
    queryFn: () => sopApi.getSopTerkait(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: DETAIL_SOP_STALE_TIME,
  })

  const addMutation = useMutation({
    mutationFn: (payload: CreateSopTerkaitDto) => sopApi.addSopTerkait(sopDetailId, payload),
    ...withMutationToast('SOP terkait berhasil ditambahkan', 'Gagal menambah SOP terkait'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sopTerkait(sopDetailId) })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (terkaitId: string) => sopApi.removeSopTerkait(sopDetailId, terkaitId),
    ...withMutationToast('SOP terkait berhasil dihapus', 'Gagal menghapus SOP terkait'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sopTerkait(sopDetailId) })
    },
  })

  return {
    list,
    isLoading,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  }
}

// ================= Edit History =================

export function useEditHistory(sopDetailId: string) {
  return useQuery({
    queryKey: queryKeys.detailSopLogs(sopDetailId),
    queryFn: () => sopApi.getEditHistory(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: DETAIL_SOP_STALE_TIME,
  })
}
