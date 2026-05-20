/**
 * Evaluasi API — selaras modul Nest `evaluation`:
 * - GET/POST `/evaluasi` → `PengajuanEvaluasiController`
 * - GET `/evaluasi/pengajuan/:id` | `.../sop-dokumen/:detailSopId` | `.../berita-acara` → `PengajuanEvaluasiDetailController`
 * - PATCH `.../nilai/:detailSopId` | `.../selesai` → `EvaluasiNilaiController`
 * - GET `/evaluasi/workspace/opd/:opdId` → `EvaluasiWorkspaceController` (evaluator/PJ evaluator/PJ penyusun)
 * - GET `/evaluasi/laporan/grafik-tahunan` → `EvaluasiGrafikController`
 */

import { apiClient, buildQueryString } from '@/lib/api/api-client'
import { unwrapApiData } from '@/lib/api/response'
import { mapEvaluasiShellToLegacyPengajuan } from '@/lib/evaluasi/evaluasi-mappers'
import type { ApiSuccessResponse } from '@/types/dto/auth.dto'
import type {
  BeritaAcaraEvaluasiView,
  NilaiEvaluasi,
  PengajuanEvaluasi,
  PengajuanEvaluasiRingkasPage,
  PengajuanEvaluasiShell,
  PengajuanSopWorkbenchResponse,
  CreatePengajuanEvaluasiDto,
  EvaluasiGrafikTahunanData,
  EvaluasiGrafikTahunanQueryParams,
  EvaluasiListQueryParams,
  EvaluasiRingkasQueryParams,
  EvaluasiWorkspaceOpdResponse,
  EvaluasiWorkspacePengajuanAktif,
  EvaluasiWorkspaceQueryParams,
  IsiNilaiEvaluasiDto,
  JenisPengajuanEvaluasi,
  SelesaiEvaluasiDto,
  StatusHasilEvaluasi,
  UmpanBalikEvaluasiDetail,
} from '@/types/dto/evaluasi.dto'
import { STATUS_HASIL_EVALUASI } from '@/types/dto/evaluasi.dto'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { queryKeys } from '@/config/query-keys'
import { STALE_TIME } from '@/utils/constants'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast, showErrorMessages } from '@/hooks/useToast'

export { mapEvaluasiShellToLegacyPengajuan } from '@/lib/evaluasi/evaluasi-mappers'
export {
  buildAjukanEvaluasiSnapshotRows,
  getAjukanEvaluasiBlockingReason,
  hasHasilEvaluasiTersimpan,
  getStatusSopAfterEvaluasi,
  getKirimUlangBlockingReason,
  canKirimUlangSetelahRevisi,
  isFormEvaluasiSopComplete,
  type AjukanEvaluasiSnapshotRow,
  type StatusHasilEvaluasiForm,
} from '@/lib/evaluasi/evaluasi-domain'

async function unwrapEvaluasiWorkspaceOpd(
  promise: Promise<ApiSuccessResponse<EvaluasiWorkspaceOpdResponse>>,
): Promise<EvaluasiWorkspaceOpdResponse> {
  return unwrapApiData(promise)
}

async function unwrapEvaluasiEnvelope<T>(
  promise: Promise<ApiSuccessResponse<T>>,
): Promise<T> {
  return unwrapApiData(promise)
}

/** Memetakan shell GET `/evaluasi/pengajuan/:id` → bentuk `PengajuanEvaluasi` untuk komponen eksisting. */
/** Bentuk query string GET `/evaluasi` (termasuk `statusIn` berulang). */
function appendEvaluasiListQuery(searchParams: URLSearchParams, params: EvaluasiListQueryParams): void {
  if (params.opdId !== undefined) searchParams.set('opdId', params.opdId)
  if (params.status !== undefined) searchParams.set('status', params.status)
  if (params.jenis !== undefined) searchParams.set('jenis', params.jenis)
  if (params.statusIn !== undefined) {
    for (const status of params.statusIn) {
      if (status != null && String(status).trim() !== '') searchParams.append('statusIn', String(status).trim())
    }
  }
}

/** Query GET `/evaluasi/ringkas` — pagination + filter + `statusIn` berulang + `search`. */
function buildEvaluasiRingkasQueryString(params: EvaluasiRingkasQueryParams): string {
  const searchParams = new URLSearchParams()
  if (params.page !== undefined) searchParams.set('page', String(params.page))
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
  if (params.opdId !== undefined) searchParams.set('opdId', params.opdId)
  if (params.status !== undefined) searchParams.set('status', params.status)
  if (params.jenis !== undefined) searchParams.set('jenis', params.jenis)
  if (params.search !== undefined && params.search.trim() !== '') {
    searchParams.set('search', params.search.trim())
  }
  if (params.statusIn !== undefined) {
    for (const status of params.statusIn) {
      if (status != null && String(status).trim() !== '') searchParams.append('statusIn', String(status).trim())
    }
  }
  const qs = searchParams.toString()
  return qs !== '' ? `?${qs}` : ''
}

export const evaluasiApi = {
  findAll: (params?: EvaluasiListQueryParams) => {
    let query = ''
    if (params !== undefined && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams()
      appendEvaluasiListQuery(searchParams, params)
      const qs = searchParams.toString()
      query = qs !== '' ? `?${qs}` : ''
    }
    return unwrapEvaluasiEnvelope(
      apiClient.get<ApiSuccessResponse<PengajuanEvaluasi[]>>(`/evaluasi${query}`),
    )
  },

  findById: (id: string) =>
    unwrapEvaluasiEnvelope(apiClient.get<ApiSuccessResponse<PengajuanEvaluasi>>(`/evaluasi/${id}`)),

  findPengajuanShell: (id: string) =>
    unwrapEvaluasiEnvelope(
      apiClient.get<ApiSuccessResponse<PengajuanEvaluasiShell>>(`/evaluasi/pengajuan/${id}`),
    ),

  findPengajuanSopDokumen: (
    pengajuanId: string,
    detailSopId: string,
    logsLimit?: number,
    opts?: { arsip?: boolean },
  ) => {
    const params = new URLSearchParams()
    if (logsLimit !== undefined) {
      params.set('logsLimit', String(logsLimit))
    }
    if (opts?.arsip === true) {
      params.set('arsip', 'true')
    }
    const qs = params.toString()
    return unwrapEvaluasiEnvelope(
      apiClient.get<ApiSuccessResponse<PengajuanSopWorkbenchResponse>>(
        `/evaluasi/pengajuan/${pengajuanId}/sop-dokumen/${detailSopId}${qs ? `?${qs}` : ''}`,
      ),
    )
  },

  findPengajuanBeritaAcara: (pengajuanId: string, opts?: { arsip?: boolean }) => {
    const qs = opts?.arsip === true ? '?arsip=true' : ''
    return unwrapEvaluasiEnvelope(
      apiClient.get<ApiSuccessResponse<BeritaAcaraEvaluasiView>>(
        `/evaluasi/pengajuan/${pengajuanId}/berita-acara${qs}`,
      ),
    )
  },

  create: (payload: CreatePengajuanEvaluasiDto) =>
    unwrapEvaluasiEnvelope(
      apiClient.post<ApiSuccessResponse<PengajuanEvaluasi>>('/evaluasi', payload),
    ),

  isiNilai: (
    pengajuanEvaluasiId: string,
    sopDetailId: string,
    payload: IsiNilaiEvaluasiDto,
  ) =>
    unwrapEvaluasiEnvelope(
      apiClient.patch<ApiSuccessResponse<NilaiEvaluasi>>(
        `/evaluasi/${pengajuanEvaluasiId}/nilai/${sopDetailId}`,
        payload,
      ),
    ),

  getUmpanBalikEvaluasi: (detailSopId: string) =>
    unwrapEvaluasiEnvelope(
      apiClient.get<ApiSuccessResponse<UmpanBalikEvaluasiDetail | null>>(
        `/evaluasi/umpan-balik/detail/${detailSopId}`,
      ),
    ),

  tandaiTindakLanjutSelesai: (pengajuanEvaluasiId: string, detailSopId: string) =>
    unwrapEvaluasiEnvelope(
      apiClient.patch<ApiSuccessResponse<NilaiEvaluasi>>(
        `/evaluasi/${pengajuanEvaluasiId}/nilai/${detailSopId}/tindak-lanjut-selesai`,
      ),
    ),

  selesai: (
    pengajuanEvaluasiId: string,
    payload: SelesaiEvaluasiDto,
  ) =>
    unwrapEvaluasiEnvelope(
      apiClient.patch<ApiSuccessResponse<PengajuanEvaluasi>>(
        `/evaluasi/${pengajuanEvaluasiId}/selesai`,
        payload,
      ),
    ),

  /** GET `/evaluasi/laporan/grafik-tahunan` - dasbor PJ evaluator (bungkus API). */
  grafikTahunan: async (params?: EvaluasiGrafikTahunanQueryParams) => {
    const envelope = await apiClient.get<ApiSuccessResponse<EvaluasiGrafikTahunanData>>(
      `/evaluasi/laporan/grafik-tahunan${buildQueryString(params as Record<string, unknown> | undefined)}`,
    )
    return envelope.data
  },

  workspaceOpd: (opdId: string, params?: EvaluasiWorkspaceQueryParams) =>
    unwrapEvaluasiWorkspaceOpd(
      apiClient.get<ApiSuccessResponse<EvaluasiWorkspaceOpdResponse>>(
        `/evaluasi/workspace/opd/${opdId}${buildQueryString(params as Record<string, unknown> | undefined)}`,
      ),
    ),

  /** GET `/evaluasi/workspace/opd-saya` — OPD dari JWT (PJ Penyusun / Kepala OPD). */
  workspaceOpdSaya: (params?: EvaluasiWorkspaceQueryParams) =>
    unwrapEvaluasiWorkspaceOpd(
      apiClient.get<ApiSuccessResponse<EvaluasiWorkspaceOpdResponse>>(
        `/evaluasi/workspace/opd-saya${buildQueryString(params as Record<string, unknown> | undefined)}`,
      ),
    ),

  workspacePengajuan: (pengajuanEvaluasiId: string, params?: EvaluasiWorkspaceQueryParams) =>
    unwrapEvaluasiWorkspaceOpd(
      apiClient.get<ApiSuccessResponse<EvaluasiWorkspaceOpdResponse>>(
        `/evaluasi/workspace/pengajuan/${pengajuanEvaluasiId}${buildQueryString(params as Record<string, unknown> | undefined)}`,
      ),
    ),

  findRingkas: (params?: EvaluasiRingkasQueryParams) =>
    unwrapEvaluasiEnvelope(
      apiClient.get<ApiSuccessResponse<PengajuanEvaluasiRingkasPage>>(
        `/evaluasi/ringkas${buildEvaluasiRingkasQueryString(params ?? {})}`,
      ),
    ),
}

/** Umpan balik evaluasi aktif untuk panel penyusun (alur revisi). */
export function useUmpanBalikEvaluasi(detailSopId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.evaluasiUmpanBalik(detailSopId ?? ''),
    queryFn: () => evaluasiApi.getUmpanBalikEvaluasi(detailSopId as string),
    enabled: Boolean(detailSopId) && enabled,
    staleTime: STALE_TIME.SHORT,
  })
}

export function useTandaiTindakLanjutSelesai(detailSopId: string | undefined) {
  return useMutationWithToast({
    mutationFn: ({
      pengajuanEvaluasiId,
      detailSopId: detailId,
    }: {
      pengajuanEvaluasiId: string
      detailSopId: string
    }) => evaluasiApi.tandaiTindakLanjutSelesai(pengajuanEvaluasiId, detailId),
    invalidateKeys: [
      queryKeys.evaluasiUmpanBalik(detailSopId ?? ''),
      queryKeys.evaluasiWorkspaceOpdAll,
      queryKeys.evaluasiWorkspacePengajuanAll,
      queryKeys.penyusunWorkbench(detailSopId ?? ''),
    ],
    successMessage: 'Umpan balik evaluasi ditandai selesai',
    errorMessagePrefix: 'Gagal menandai tindak lanjut',
  })
}


// ==================== Evaluasi Hooks ====================
export function useEvaluasi(params?: EvaluasiListQueryParams & { enabled?: boolean }) {
  const enabled = params?.enabled ?? true;
  const listParams: EvaluasiListQueryParams | undefined =
    params === undefined
      ? undefined
      : (Object.fromEntries(
          Object.entries({
            opdId: params.opdId,
            status: params.status,
            jenis: params.jenis,
            statusIn:
              params.statusIn !== undefined && params.statusIn.length > 0
                ? [...params.statusIn]
                : undefined,
          }).filter(([, v]) => v !== undefined),
        ) as EvaluasiListQueryParams);
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.evaluasiList(listParams),
    queryFn: () => evaluasiApi.findAll(listParams),
    staleTime: STALE_TIME.MEDIUM,
    enabled,
  });

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreatePengajuanEvaluasiDto) =>
      evaluasiApi.create(payload),
    invalidateKeys: [
      queryKeys.evaluasi,
      queryKeys.evaluasiRingkasAll,
      queryKeys.evaluasiWorkspaceOpdAll,
      queryKeys.evaluasiWorkspaceOpdSayaAll,
      queryKeys.evaluasiWorkspacePengajuanAll,
    ],
    successMessage: "Pengajuan evaluasi berhasil dibuat",
    errorMessagePrefix: "Gagal membuat pengajuan evaluasi",
  });

  return {
    list,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

/** Status pengajuan yang masih berjalan di sisi evaluator. */
export const STATUS_PENGAJUAN_BERJALAN_EVALUATOR = [
  "SEDANG_DIEVALUASI",
] as const satisfies readonly PengajuanEvaluasi["status"][];

/** Status pengajuan yang siap aksi TTD oleh PJ Evaluator. */
export const STATUS_PENGAJUAN_SIAP_TTD_PJ_EVALUATOR = [
  "SELESAI_DIEVALUASI",
] as const satisfies readonly PengajuanEvaluasi["status"][];

/** Riwayat final (arsip selesai total). */
export const STATUS_RIWAYAT_FINAL_EVALUASI = [
  "SELESAI",
] as const satisfies readonly PengajuanEvaluasi["status"][];

/** Halaman Berita Acara PJ Penyusun — tab Perlu TTE. */
export const STATUS_BERITA_ACARA_PERLU_TTE = [
  "DIVERIFIKASI_PJ_EVALUATOR",
] as const satisfies readonly PengajuanEvaluasi["status"][];

/** Halaman Berita Acara PJ Penyusun — tab Riwayat. */
export const STATUS_BERITA_ACARA_RIWAYAT = [
  "DITANDATANGANI_PJ_PENYUSUN",
  "SELESAI",
] as const satisfies readonly PengajuanEvaluasi["status"][];

/** Semua status yang ditampilkan di halaman Berita Acara PJ Penyusun. */
export const STATUS_BERITA_ACARA_SEMUA = [
  ...STATUS_BERITA_ACARA_PERLU_TTE,
  ...STATUS_BERITA_ACARA_RIWAYAT,
] as const satisfies readonly PengajuanEvaluasi["status"][];

const BERITA_ACARA_PERLU_TTE_SET = new Set<string>(STATUS_BERITA_ACARA_PERLU_TTE);
const BERITA_ACARA_RIWAYAT_SET = new Set<string>(STATUS_BERITA_ACARA_RIWAYAT);

const KEPALA_OPD_PENDING_SIGN_STATUSES: readonly PengajuanEvaluasi["status"][] = [
  "DITANDATANGANI_PJ_PENYUSUN",
];
const KEPALA_OPD_SIGNED_STATUSES: readonly PengajuanEvaluasi["status"][] = [
  "SELESAI",
];
const KEPALA_OPD_PENGAJUAN_STATUSES: readonly PengajuanEvaluasi["status"][] = [
  ...KEPALA_OPD_PENDING_SIGN_STATUSES,
  ...KEPALA_OPD_SIGNED_STATUSES,
];

export interface KepalaOpdPengajuanBuckets {
  belumDitandatangani: PengajuanEvaluasi[];
  sudahBerlaku: PengajuanEvaluasi[];
}

export function useKepalaOpdPengajuan(opdId?: string) {
  const { list, isLoading, error } = useEvaluasi({
    opdId,
    statusIn: [...KEPALA_OPD_PENGAJUAN_STATUSES],
    enabled: Boolean(opdId),
  });

  const buckets = useMemo<KepalaOpdPengajuanBuckets>(() => {
    const belumDitandatangani = list.filter((item) =>
      KEPALA_OPD_PENDING_SIGN_STATUSES.includes(item.status),
    );
    const sudahBerlaku = list.filter((item) =>
      KEPALA_OPD_SIGNED_STATUSES.includes(item.status),
    );
    return { belumDitandatangani, sudahBerlaku };
  }, [list]);

  return {
    ...buckets,
    isLoading,
    error,
  };
}

export interface BeritaAcaraPjPenyusunBuckets {
  perluTindakan: PengajuanEvaluasi[];
  riwayat: PengajuanEvaluasi[];
}

/** Daftar Berita Acara PJ Penyusun — tab Perlu TTE vs Riwayat (satu fetch, bucket di client). */
export function useBeritaAcaraPjPenyusun() {
  const { list, isLoading, error } = useEvaluasi({
    statusIn: [...STATUS_BERITA_ACARA_SEMUA],
  });

  const buckets = useMemo<BeritaAcaraPjPenyusunBuckets>(() => {
    const perluTindakan = list.filter((item) =>
      BERITA_ACARA_PERLU_TTE_SET.has(item.status),
    );
    const riwayat = list.filter((item) => BERITA_ACARA_RIWAYAT_SET.has(item.status));
    return { perluTindakan, riwayat };
  }, [list]);

  return {
    ...buckets,
    isLoading,
    error,
  };
}

/** Workspace OPD pengguna (GET `/evaluasi/workspace/opd-saya`) — dialog buka pengajuan PJ Penyusun. */
export function useEvaluasiWorkspaceOpdSaya(
  params?: EvaluasiWorkspaceQueryParams & { enabled?: boolean },
) {
  const enabled = params?.enabled ?? true;
  const queryParams: EvaluasiWorkspaceQueryParams | undefined =
    params === undefined
      ? undefined
      : {
          detailSopId: params.detailSopId,
          expand: params.expand,
          riwayatLimit: params.riwayatLimit,
        };
  return useQuery({
    queryKey: queryKeys.evaluasiWorkspaceOpdSaya(queryParams),
    queryFn: () => evaluasiApi.workspaceOpdSaya(queryParams),
    enabled,
    staleTime: STALE_TIME.SHORT,
  });
}

/** Workspace evaluasi per OPD - satu GET agregat untuk halaman evaluator dan dialog PJ penyusun. */
export function useEvaluasiWorkspaceOpd(
  opdId: string,
  params?: EvaluasiWorkspaceQueryParams & { enabled?: boolean },
) {
  const enabled = params?.enabled ?? true;
  const queryParams: EvaluasiWorkspaceQueryParams | undefined =
    params === undefined
      ? undefined
      : {
          detailSopId: params.detailSopId,
          expand: params.expand,
          riwayatLimit: params.riwayatLimit,
        };
  return useQuery({
    queryKey: queryKeys.evaluasiWorkspaceOpd(opdId, queryParams),
    queryFn: () => evaluasiApi.workspaceOpd(opdId, queryParams),
    enabled: Boolean(opdId) && enabled,
    staleTime: STALE_TIME.SHORT,
  });
}

/** Workspace evaluasi untuk satu pengajuan (`GET /evaluasi/workspace/pengajuan/:id`). */
export function useEvaluasiWorkspacePengajuan(
  pengajuanEvaluasiId: string,
  params?: EvaluasiWorkspaceQueryParams & { enabled?: boolean },
) {
  const enabled = params?.enabled ?? true;
  const queryParams: EvaluasiWorkspaceQueryParams | undefined =
    params === undefined
      ? undefined
      : {
          detailSopId: params.detailSopId,
          expand: params.expand,
          riwayatLimit: params.riwayatLimit,
        };
  return useQuery({
    queryKey: queryKeys.evaluasiWorkspacePengajuan(pengajuanEvaluasiId, queryParams),
    queryFn: () => evaluasiApi.workspacePengajuan(pengajuanEvaluasiId, queryParams),
    enabled: Boolean(pengajuanEvaluasiId) && enabled,
    staleTime: STALE_TIME.SHORT,
  });
}

/** Daftar ringkas terpaginasi (`GET /evaluasi/ringkas`). */
export function usePengajuanEvaluasiRingkas(
  params: EvaluasiRingkasQueryParams & { enabled?: boolean },
) {
  const enabled = params.enabled ?? true;
  const ringkasParams: EvaluasiRingkasQueryParams = {
    page: params.page,
    limit: params.limit,
    opdId: params.opdId,
    status: params.status,
    jenis: params.jenis,
    search: params.search,
    statusIn: params.statusIn,
  };
  return useQuery({
    queryKey: queryKeys.evaluasiRingkas(ringkasParams as Record<string, unknown>),
    queryFn: () => evaluasiApi.findRingkas(ringkasParams),
    staleTime: STALE_TIME.SHORT,
    enabled,
  });
}

export function useEvaluasiGrafikTahunan(params?: EvaluasiGrafikTahunanQueryParams) {
  return useQuery({
    queryKey: queryKeys.evaluasiGrafikTahunan(params),
    queryFn: () => evaluasiApi.grafikTahunan(params),
    staleTime: 10 * 60 * 1000,
  });
}

// ==================== Pengajuan Evaluasi ====================

const PENGAJUAN_SHELL_STALE_MS = STALE_TIME.SHORT
/** Batas log workbench di panel pratinjau PJ evaluator. */
const PJ_EVAL_PREVIEW_WORKBENCH_LOGS = 100

export function usePengajuanEvaluasiDetail(pengajuanId?: string) {
  const { data: shell, isLoading: loading } = useQuery({
    queryKey: queryKeys.evaluasiPengajuanShell(pengajuanId || ''),
    queryFn: () => evaluasiApi.findPengajuanShell(pengajuanId || ''),
    enabled: !!pengajuanId,
    staleTime: PENGAJUAN_SHELL_STALE_MS,
  })

  const pengajuan = useMemo(
    () => (shell ? mapEvaluasiShellToLegacyPengajuan(shell) : null),
    [shell],
  )

  const isVerified = pengajuan?.status === 'DIVERIFIKASI_PJ_EVALUATOR'
  const canVerify = pengajuan?.status === 'SELESAI_DIEVALUASI'

  return {
    pengajuan: pengajuan || null,
    shell: shell ?? null,
    isVerified,
    canVerify,
    loading,
  }
}

export function usePengajuanSopDokumenWorkbench(
  pengajuanId?: string,
  detailSopId?: string | null,
  opts?: { enabled?: boolean },
) {
  const enabled =
    !!(pengajuanId && detailSopId) && (opts?.enabled ?? true)
  const pid = pengajuanId || ''
  const dsid = detailSopId || ''
  return useQuery({
    queryKey: queryKeys.evaluasiPengajuanSopDokumen(pid, dsid, PJ_EVAL_PREVIEW_WORKBENCH_LOGS),
    queryFn: () =>
      evaluasiApi.findPengajuanSopDokumen(pid, dsid, PJ_EVAL_PREVIEW_WORKBENCH_LOGS),
    enabled,
    staleTime: STALE_TIME.MEDIUM,
  })
}

export function usePengajuanBeritaAcaraView(pengajuanId?: string, opts?: { enabled?: boolean }) {
  const enabled = !!pengajuanId && (opts?.enabled ?? true)
  return useQuery({
    queryKey: queryKeys.evaluasiPengajuanBeritaAcara(pengajuanId || ''),
    queryFn: () => evaluasiApi.findPengajuanBeritaAcara(pengajuanId || ''),
    enabled,
    staleTime: STALE_TIME.MEDIUM,
  })
}

/**
 * useEvaluasiDraft Hook - Server-Side Auto-Save
 * Per-SOP evaluation draft state management with real API persistence
 *
 * Workflow:
 * 1. Fetches active pengajuan evaluasi for the OPD
 * 2. Maps sopId (header) to sopDetailId from pengajuan.sopList
 * 3. Loads existing nilaiEvaluasi if any
 * 4. Auto-saves via evaluasiApi.isiNilai() with debounce
 * 5. Handles optimistic locking with version tracking
 */

const AUTO_SAVE_DELAY_MS = 1500;

export interface UseEvaluasiDraftReturn {
  statusEvaluasi: StatusHasilEvaluasi | null;
  setStatusEvaluasi: (status: StatusHasilEvaluasi | null) => void;
  komentarEvaluasi: string;
  setKomentarEvaluasi: (komentar: string) => void;
  saveDraft: () => void;
  clearDraft: () => void;
  isSaving: boolean;
  error: Error | null;
}

export function useEvaluasiDraft(
  opdId?: string,
  sopId?: string,
  workspacePengajuanAktif?: EvaluasiWorkspacePengajuanAktif | null,
  readOnly = false,
  tahapPenilaian?: import('@/lib/evaluasi/evaluasi-domain').TahapPenilaianSop,
): UseEvaluasiDraftReturn {
  const {
    pengajuanId,
    pengajuan,
    isLoading: isLoadingPengajuan,
    getCurrentVersion,
  } = usePengajuanEvaluasiAktif(opdId, workspacePengajuanAktif);

  // Map sopId (header) to sopDetailId from pengajuan
  const sopDetailId = useMemo(() => {
    if (!pengajuan || !sopId) return null;
    // Find the SOP in pengajuan's sopList
    const sopInPengajuan = pengajuan.nilaiEvaluasi?.find(
      (n) => n.sopDetail?.id === sopId,
    );
    // Or check if sopId is already the detail ID
    const sopInList = pengajuan.nilaiEvaluasi?.find(
      (n) => n.sopDetailId === sopId,
    );
    return sopInPengajuan?.sopDetailId ?? sopInList?.sopDetailId ?? null;
  }, [pengajuan, sopId]);

  // Load existing nilaiEvaluasi from pengajuan
  const existingNilai = useMemo(() => {
    if (!pengajuan || !sopDetailId) return null;
    return (
      pengajuan.nilaiEvaluasi?.find((n) => n.sopDetailId === sopDetailId) ??
      null
    );
  }, [pengajuan, sopDetailId]);

  // Initialize state from existing nilai
  const [statusEvaluasi, setStatusEvaluasiState] =
    useState<StatusHasilEvaluasi | null>(existingNilai?.hasil ?? null);
  const [komentarEvaluasi, setKomentarEvaluasiState] = useState<string>(
    existingNilai?.catatan ?? "",
  );

  const isTinjauanUlang = tahapPenilaian === 'tinjauan_ulang';
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSubmittedRef = useRef<string | null>(null);

  useEffect(() => {
    if (isTinjauanUlang) {
      setStatusEvaluasiState(null);
      setKomentarEvaluasiState('');
      lastSubmittedRef.current = null;
      return;
    }
    setStatusEvaluasiState(existingNilai?.hasil ?? null);
    setKomentarEvaluasiState(existingNilai?.catatan ?? '');
  }, [existingNilai?.hasil, existingNilai?.catatan, sopDetailId, isTinjauanUlang]);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Save draft mutation
  const saveDraftMutation = useMutationWithToast({
    mutationFn: async ({
      status,
      komentar,
    }: {
      status: StatusHasilEvaluasi;
      komentar: string;
    }) => {
      if (!pengajuanId || !sopDetailId) {
        throw new Error("Data evaluasi belum tersedia");
      }

      const version = getCurrentVersion(sopDetailId);

      return evaluasiApi.isiNilai(pengajuanId, sopDetailId, {
        hasil: status,
        catatan: komentar,
        version,
      });
    },
    invalidateKeys: [
      queryKeys.evaluasi,
      queryKeys.evaluasiWorkspaceOpdAll,
      queryKeys.evaluasiWorkspacePengajuanAll,
      queryKeys.evaluasiRingkasAll,
    ],
    successMessage: "Draft evaluasi berhasil disimpan",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal menyimpan draft evaluasi",
    onError: (error: Error) => {
      if (error.message?.includes("Konflik versi")) {
        // Version conflict is handled by useDetailedErrors, but we can add custom logic here if needed
      }
    },
  });

  /** Trigger auto-save with debounce */
  const triggerAutoSave = useCallback(() => {
    if (readOnly) {
      return;
    }
    if (!pengajuanId || !sopDetailId || isLoadingPengajuan) {
      return;
    }
    if (statusEvaluasi == null) return; // Don't save if no status yet
    if (
      statusEvaluasi === STATUS_HASIL_EVALUASI.PERLU_PERBAIKAN &&
      komentarEvaluasi.trim().length === 0
    ) {
      return;
    }

    // Hindari autosave bila tidak ada perubahan dibanding server state.
    const existingHasil = isTinjauanUlang
      ? null
      : (existingNilai?.hasil ?? null);
    const existingCatatan = isTinjauanUlang
      ? ''
      : (existingNilai?.catatan ?? '').trim();
    if (
      statusEvaluasi === existingHasil &&
      komentarEvaluasi.trim() === existingCatatan
    ) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const currentStatus = statusEvaluasi;
    const currentKomentar = komentarEvaluasi;

    autoSaveTimerRef.current = setTimeout(() => {
      const version = sopDetailId ? getCurrentVersion(sopDetailId) : null;
      const signature = JSON.stringify({
        sopDetailId,
        status: currentStatus,
        komentar: currentKomentar.trim(),
        version,
      });
      if (lastSubmittedRef.current === signature) {
        return;
      }
      lastSubmittedRef.current = signature;
      saveDraftMutation.mutate({
        status: currentStatus,
        komentar: currentKomentar,
      });
    }, AUTO_SAVE_DELAY_MS);
  }, [
    readOnly,
    pengajuanId,
    sopDetailId,
    isLoadingPengajuan,
    statusEvaluasi,
    komentarEvaluasi,
    saveDraftMutation,
    existingNilai?.hasil,
    existingNilai?.catatan,
    getCurrentVersion,
    isTinjauanUlang,
  ]);

  const setStatusEvaluasi = useCallback(
    (status: StatusHasilEvaluasi | null) => {
      setStatusEvaluasiState(status);
      // Will trigger auto-save via useEffect
    },
    [],
  );

  const setKomentarEvaluasi = useCallback((komentar: string) => {
    setKomentarEvaluasiState(komentar);
    // Will trigger auto-save via useEffect
  }, []);

  // Auto-save when status or komentar changes
  useEffect(() => {
    triggerAutoSave();
  }, [triggerAutoSave]);

  /** Manual save - immediate, no debounce */
  const saveDraft = useCallback(() => {
    if (readOnly) {
      return;
    }
    if (!pengajuanId || !sopDetailId || statusEvaluasi == null) {
      return;
    }
    if (
      statusEvaluasi === STATUS_HASIL_EVALUASI.PERLU_PERBAIKAN &&
      komentarEvaluasi.trim().length === 0
    ) {
      return;
    }
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    saveDraftMutation.mutate({
      status: statusEvaluasi,
      komentar: komentarEvaluasi,
    });
  }, [
    readOnly,
    pengajuanId,
    sopDetailId,
    statusEvaluasi,
    komentarEvaluasi,
    saveDraftMutation,
  ]);

  const clearDraft = useCallback(() => {
    setStatusEvaluasiState(null);
    setKomentarEvaluasiState("");
  }, []);

  return {
    statusEvaluasi,
    setStatusEvaluasi,
    komentarEvaluasi,
    setKomentarEvaluasi,
    saveDraft,
    clearDraft,
    isSaving: saveDraftMutation.isPending,
    error: saveDraftMutation.error,
  };
}

/**
 * useEvaluasiSubmit — menyelesaikan pengajuan (PATCH selesai) setelah semua SOP SESUAI di server.
 */

interface UseEvaluasiSubmitConfig {
  pengajuanAktifId: string | undefined;
  ratingOPD: number | null;
  /** false untuk pengajuan MANDIRI — PATCH selesai tanpa nilaiOPD. */
  requiresNilaiOpd: boolean;
  canSubmit: boolean;
  blockingMessage: string | null;
  onSuccess?: () => void;
}

export function useEvaluasiSubmit(config: UseEvaluasiSubmitConfig) {
  const {
    pengajuanAktifId,
    ratingOPD,
    requiresNilaiOpd,
    canSubmit,
    blockingMessage,
    onSuccess,
  } = config;
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [terjadwalSubmitError, setTerjadwalSubmitError] = useState<
    string | null
  >(null);

  const clearTerjadwalSubmitError = useCallback(() => {
    setTerjadwalSubmitError(null);
  }, []);

  const handleSubmitAll = useCallback(async () => {
    if (!pengajuanAktifId) {
      setTerjadwalSubmitError("Pengajuan evaluasi tidak tersedia.");
      return;
    }
    if (!canSubmit) {
      setTerjadwalSubmitError(
        blockingMessage ?? "Syarat pengajuan belum terpenuhi.",
      );
      return;
    }
    if (requiresNilaiOpd && (ratingOPD === null || ratingOPD < 1 || ratingOPD > 5)) {
      setTerjadwalSubmitError("Isi skor evaluasi OPD (1–5) di tab Evaluasi OPD.");
      return;
    }
    setIsSubmitting(true);
    setTerjadwalSubmitError(null);
    try {
      const payload: SelesaiEvaluasiDto = requiresNilaiOpd
        ? { nilaiOPD: ratingOPD! }
        : {};
      await evaluasiApi.selesai(pengajuanAktifId, payload);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.evaluasiWorkspaceOpdAll,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.evaluasiWorkspacePengajuanAll,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.evaluasiRingkasAll,
      });
      showToast("Pengajuan berhasil diajukan ke PJ Evaluator", "success");
      onSuccess?.();
    } catch (error) {
      const err = error as Error;
      const message = err.message || "Gagal mengajukan hasil evaluasi";
      setTerjadwalSubmitError(message);
      showErrorMessages(error, message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    pengajuanAktifId,
    ratingOPD,
    requiresNilaiOpd,
    canSubmit,
    blockingMessage,
    queryClient,
    showToast,
    onSuccess,
  ]);

  return {
    isSubmitting,
    handleSubmitAll,
    terjadwalSubmitError,
    clearTerjadwalSubmitError,
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
 * usePengajuanEvaluasiAktif Hook
 * Finds the active evaluation submission (SEDANG_DIEVALUASI) for an OPD
 */

export interface UsePengajuanEvaluasiAktifReturn {
  /** Pengajuan ID (null if no active pengajuan) */
  pengajuanId: string | null;
  /** Full pengajuan data */
  pengajuan: {
    id: string;
    status: string;
    statusLabel: string;
    jenis: JenisPengajuanEvaluasi;
    nilaiEvaluasi: NilaiEvaluasi[];
  } | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Get current version for a SOP detail */
  getCurrentVersion: (sopDetailId: string) => number;
}

/**
 * Pilih pengajuan yang masih bisa dinilai evaluator (selaras workspace + PATCH nilai).
 */
function pickPengajuanAktifUntukEvaluator(
  list: PengajuanEvaluasi[],
): PengajuanEvaluasi | null {
  const aktif = list.filter((p) => p.status === "SEDANG_DIEVALUASI");
  if (aktif.length === 0) {
    return null;
  }
  return (
    [...aktif].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null
  );
}

/**
 * Hook to find active evaluation submission for an OPD
 * @param opdId - OPD ID to find active pengajuan for
 */
export function usePengajuanEvaluasiAktif(
  opdId?: string,
  workspacePengajuanAktif?: EvaluasiWorkspacePengajuanAktif | null,
): UsePengajuanEvaluasiAktifReturn {
  /** Hanya pakai bundel workspace bila server mengirim objek pengajuan; `null` = muat ulang via GET /evaluasi. */
  const fromWorkspace =
    workspacePengajuanAktif !== undefined && workspacePengajuanAktif !== null;
  const {
    list: pengajuanList,
    isLoading,
    error,
  } = useEvaluasi({
    opdId,
    enabled: Boolean(opdId) && !fromWorkspace,
  });

  const activePengajuan = useMemo(() => {
    if (fromWorkspace) {
      const p = workspacePengajuanAktif!;
      return {
        id: p.id,
        status: p.status,
        statusLabel: p.statusLabel,
        jenis: p.jenis,
        nilaiEvaluasi: p.nilaiPerDetail.map(
          (n): NilaiEvaluasi => ({
            id: `ws-${n.detailSopId}`,
            pengajuanEvaluasiId: p.id,
            sopDetailId: n.detailSopId,
            hasil:
              n.hasil === "SESUAI" || n.hasil === "PERLU_PERBAIKAN"
                ? n.hasil
                : undefined,
            catatan: n.catatan ?? undefined,
            version: n.version,
            createdAt: "",
            updatedAt: "",
          }),
        ),
      };
    }
    if (!pengajuanList || pengajuanList.length === 0) {
      return null;
    }
    const picked = pickPengajuanAktifUntukEvaluator(pengajuanList);
    if (!picked) {
      return null;
    }
    return {
      id: picked.id,
      status: picked.status,
      statusLabel: picked.statusLabel ?? picked.status,
      jenis: picked.jenis,
      nilaiEvaluasi: picked.nilaiEvaluasi ?? [],
    };
  }, [fromWorkspace, workspacePengajuanAktif, pengajuanList]);

  const getCurrentVersion = (detailId: string): number => {
    if (!activePengajuan?.nilaiEvaluasi) {
      return 0;
    }
    const nilai = activePengajuan.nilaiEvaluasi.find((n) => n.sopDetailId === detailId);
    return nilai?.version ?? 0;
  };

  return {
    pengajuanId: activePengajuan?.id ?? null,
    pengajuan: activePengajuan
      ? {
          id: activePengajuan.id,
          status: activePengajuan.status,
          statusLabel: activePengajuan.statusLabel,
          jenis: activePengajuan.jenis ?? "TERJADWAL",
          nilaiEvaluasi: activePengajuan.nilaiEvaluasi ?? [],
        }
      : null,
    isLoading: fromWorkspace ? false : isLoading,
    error: fromWorkspace ? null : error,
    getCurrentVersion,
  };
}
