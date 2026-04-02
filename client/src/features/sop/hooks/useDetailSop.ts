/**
 * useDetailSop hooks - TanStack Query
 * Covers: DetailSOP CRUD, LangkahSOP, Lampiran, DasarHukum, SopTerkait, Swimlane, EditHistory
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sopApi } from '@/features/sop'
import { queryKeys } from '@/utils/query-keys'
import { useToast } from '@/utils/ui'
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
} from '@/features/sop'

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
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMetadataDto }) =>
      sopApi.updateMetadata(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detailSop })
      showToast('Metadata SOP berhasil diperbarui', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal memperbarui metadata', 'error'),
  })
}

export function useUpdateStatus() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStatusDto }) =>
      sopApi.updateStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detailSop })
      queryClient.invalidateQueries({ queryKey: queryKeys.sop })
      showToast('Status SOP berhasil diubah', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal mengubah status', 'error'),
  })
}

// ================= LangkahSOP =================

export function useLangkahSop(sopDetailId: string) {
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const { data: list = [], isLoading, error } = useQuery({
    queryKey: queryKeys.langkahSopByDetail(sopDetailId),
    queryFn: () => sopApi.findLangkah(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: DETAIL_SOP_STALE_TIME,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateLangkahSOPDto) => sopApi.createLangkah(sopDetailId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.langkahSopByDetail(sopDetailId) })
      showToast('Langkah berhasil ditambahkan', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menambah langkah', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLangkahSOPDto }) =>
      sopApi.updateLangkah(sopDetailId, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.langkahSopByDetail(sopDetailId) })
      showToast('Langkah berhasil diperbarui', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal memperbarui langkah', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sopApi.deleteLangkah(sopDetailId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.langkahSopByDetail(sopDetailId) })
      showToast('Langkah berhasil dihapus', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menghapus langkah', 'error'),
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
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.swimlane(sopDetailId),
    queryFn: () => sopApi.getSwimlane(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: DETAIL_SOP_STALE_TIME,
  })

  const addMutation = useMutation({
    mutationFn: (payload: CreateDetailSOPPelaksanaDto) => sopApi.addSwimlane(sopDetailId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swimlane(sopDetailId) })
      showToast('Pelaksana berhasil ditambahkan ke swimlane', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menambah pelaksana ke swimlane', 'error'),
  })

  const removeMutation = useMutation({
    mutationFn: (pelaksanaId: string) => sopApi.removeSwimlane(sopDetailId, pelaksanaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swimlane(sopDetailId) })
      showToast('Pelaksana berhasil dihapus dari swimlane', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menghapus pelaksana dari swimlane', 'error'),
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
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.lampiran(sopDetailId),
    queryFn: () => sopApi.findLampiran(sopDetailId, jenis),
    enabled: !!sopDetailId,
    staleTime: DETAIL_SOP_STALE_TIME,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateLampiranTeksDto) => sopApi.createLampiran(sopDetailId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lampiran(sopDetailId) })
      showToast('Lampiran berhasil ditambahkan', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menambah lampiran', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ lampiranId, teks }: { lampiranId: string; teks: string }) =>
      sopApi.updateLampiran(sopDetailId, lampiranId, teks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lampiran(sopDetailId) })
      showToast('Lampiran berhasil diperbarui', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal memperbarui lampiran', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (lampiranId: string) => sopApi.deleteLampiran(sopDetailId, lampiranId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lampiran(sopDetailId) })
      showToast('Lampiran berhasil dihapus', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menghapus lampiran', 'error'),
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
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.dasarHukum(sopDetailId),
    queryFn: () => sopApi.getDasarHukum(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: DETAIL_SOP_STALE_TIME,
  })

  const addMutation = useMutation({
    mutationFn: (payload: CreateDasarHukumDto) => sopApi.addDasarHukum(sopDetailId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dasarHukum(sopDetailId) })
      showToast('Dasar hukum berhasil ditambahkan', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menambah dasar hukum', 'error'),
  })

  const removeMutation = useMutation({
    mutationFn: (peraturanId: string) => sopApi.removeDasarHukum(sopDetailId, peraturanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dasarHukum(sopDetailId) })
      showToast('Dasar hukum berhasil dihapus', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menghapus dasar hukum', 'error'),
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
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.sopTerkait(sopDetailId),
    queryFn: () => sopApi.getSopTerkait(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: DETAIL_SOP_STALE_TIME,
  })

  const addMutation = useMutation({
    mutationFn: (payload: CreateSopTerkaitDto) => sopApi.addSopTerkait(sopDetailId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sopTerkait(sopDetailId) })
      showToast('SOP terkait berhasil ditambahkan', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menambah SOP terkait', 'error'),
  })

  const removeMutation = useMutation({
    mutationFn: (terkaitId: string) => sopApi.removeSopTerkait(sopDetailId, terkaitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sopTerkait(sopDetailId) })
      showToast('SOP terkait berhasil dihapus', 'success')
    },
    onError: (error: Error) => showToast(error.message || 'Gagal menghapus SOP terkait', 'error'),
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

// ==================== Legacy Helpers ====================
/** @internal Legacy stub - implement with real SOP list from useSop */
export function getRelatedPosOptions(_currentSopId: string): Array<{ value: string; label: string }> {
  // TODO: Implement with real SOP list from useSop hook
  return []
}

/** @internal Legacy stub - implement with real data from API */
export function getSopViewMetadata(_sopId: string) {
  // TODO: Implement with real API call
  return { metadata: null, procedures: [], implementers: [] }
}

/** @internal Legacy stub - implement with real data from API */
export function getSopViewVersions(_sopId: string) {
  // TODO: Implement with real API call
  return []
}
