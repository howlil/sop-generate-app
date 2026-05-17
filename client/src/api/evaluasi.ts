/**
 * Evaluasi API — selaras modul Nest `evaluation`:
 * - GET/POST `/evaluasi` → `PengajuanEvaluasiController`
 * - GET `/evaluasi/pengajuan/:id` | `.../sop-dokumen/:detailSopId` | `.../berita-acara` → `PengajuanEvaluasiDetailController`
 * - PATCH `.../nilai/:detailSopId` | `.../selesai` → `EvaluasiNilaiController`
 * - GET `/evaluasi/workspace/opd/:opdId` → `EvaluasiWorkspaceController` (evaluator/PJ evaluator/PJ penyusun)
 * - GET `/evaluasi/laporan/grafik-tahunan` → `EvaluasiGrafikController`
 */

import { apiClient, buildQueryString } from '@/lib/api/api-client'
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
  IsiNilaiEvaluasiMutationDto,
  JenisPengajuanEvaluasi,
  SelesaiEvaluasiDto,
  SelesaiEvaluasiMutationDto,
  StatusHasilEvaluasi,
} from '@/types/dto/evaluasi.dto'
import { STATUS_HASIL_EVALUASI, buildNilaiEvaluasiClientId } from '@/types/dto/evaluasi.dto'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { queryKeys } from '@/config/query-keys'
import { STALE_TIME } from '@/utils/constants'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useToast, showErrorMessages } from '@/hooks/useToast'

async function unwrapEvaluasiWorkspaceOpd(
  promise: Promise<ApiSuccessResponse<EvaluasiWorkspaceOpdResponse>>,
): Promise<EvaluasiWorkspaceOpdResponse> {
  const envelope = await promise
  return envelope.data
}

async function unwrapEvaluasiEnvelope<T>(
  promise: Promise<ApiSuccessResponse<T>>,
): Promise<T> {
  const envelope = await promise
  return envelope.data
}

/** Memetakan shell GET `/evaluasi/pengajuan/:id` → bentuk `PengajuanEvaluasi` untuk komponen eksisting. */
export function mapEvaluasiShellToLegacyPengajuan(shell: PengajuanEvaluasiShell): PengajuanEvaluasi {
  return {
    id: shell.id,
    opdId: shell.opdId,
    opdNama: shell.opdNama,
    jenis: shell.jenis as PengajuanEvaluasi["jenis"],
    status: shell.status as PengajuanEvaluasi["status"],
    nomorBA: shell.nomorBA,
    tanggalPermintaan: shell.tanggalPermintaan,
    tanggalEvaluasi: shell.tanggalEvaluasi,
    tanggalVerifikasi: shell.tanggalVerifikasi ?? null,
    nilaiOPD: shell.nilaiOPD,
    diverifikasiOlehUserId: shell.diverifikasiOlehUserId,
    namaPjEvaluator: shell.namaPjEvaluator,
    ditandatanganiOlehPjPenyusunUserId: shell.ditandatanganiOlehPjPenyusunUserId,
    namaPjPenyusun: shell.namaPjPenyusun,
    tanggalTTDBaPjPenyusun: shell.tanggalTTDBaPjPenyusun,
    diselesaikanOlehId: shell.diselesaikanOlehId,
    diselesaikanOleh: shell.diselesaikanOleh,
    opd: shell.opd,
    timEvaluasi: shell.timEvaluasi,
    tanggalDiselesaikan: shell.tanggalDiselesaikan,
    nilaiEvaluasi: shell.nilaiEvaluasi,
    sopList: shell.sopItems.map((item) => ({
      id: buildNilaiEvaluasiClientId(shell.id, item.detailSopId),
      sopDetailId: item.detailSopId,
      judul: item.judul,
      nomor: item.nomorSOP,
      nama: item.judul,
      nomorSOP: item.nomorSOP,
      status: item.statusDetailSop,
      hasil: item.hasilEvaluasi as StatusHasilEvaluasi | undefined,
    })),
    riwayatEvaluasi: shell.timelineNilai.map((t) => ({
      id: t.id,
      sopDetailId: t.sopDetailId,
      evaluatorId: t.evaluatorId,
      evaluatorNama: t.evaluatorNama,
      hasilSebelum: t.hasilSebelum,
      hasilSesudah: t.hasilSesudah,
      catatanSebelum: t.catatanSebelum,
      catatanSesudah: t.catatanSesudah,
      createdAt: t.createdAt,
    })),
    version: shell.version,
    createdAt: shell.createdAt,
    updatedAt: shell.updatedAt,
  }
}

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
  ) => {
    const qs =
      logsLimit !== undefined
        ? `?${new URLSearchParams({ logsLimit: String(logsLimit) }).toString()}`
        : ''
    return unwrapEvaluasiEnvelope(
      apiClient.get<ApiSuccessResponse<PengajuanSopWorkbenchResponse>>(
        `/evaluasi/pengajuan/${pengajuanId}/sop-dokumen/${detailSopId}${qs}`,
      ),
    )
  },

  findPengajuanBeritaAcara: (pengajuanId: string) =>
    unwrapEvaluasiEnvelope(
      apiClient.get<ApiSuccessResponse<BeritaAcaraEvaluasiView>>(
        `/evaluasi/pengajuan/${pengajuanId}/berita-acara`,
      ),
    ),

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

  update: (id: string, payload: Partial<PengajuanEvaluasi>) =>
    apiClient.patch<PengajuanEvaluasi>(`/evaluasi/${id}`, payload),

  /** GET `/evaluasi/laporan/grafik-tahunan` — dasbor PJ evaluator (bungkus API). */
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

// ==================== Evaluasi Domain Logic ====================
export interface StatusHasilEvaluasiForm {
  hasil: StatusHasilEvaluasi;
  catatan: string;
}

export function getStatusSopAfterEvaluasi(hasil: StatusHasilEvaluasi): string {
  if (hasil === "SESUAI") {
    return "SIAP_DIVERIFIKASI";
  }
  return "REVISI_DARI_EVALUATOR";
}

export function isFormEvaluasiSopComplete(
  form: StatusHasilEvaluasiForm,
): boolean {
  return !!form.hasil && (form.hasil as string) !== "";
}

/** Satu baris ringkasan untuk dialog ajukan ke PJ (merge draft SOP terpilih). */
export interface AjukanEvaluasiSnapshotRow {
  readonly detailSopId: string;
  readonly judul: string;
  readonly nomorSOP: string;
  readonly hasilLabel: string;
}

/** Alasan tombol ajukan dinonaktifkan; `null` berarti syarat klien terpenuhi. */
export function getAjukanEvaluasiBlockingReason(
  pengajuan: EvaluasiWorkspacePengajuanAktif | null | undefined,
  ratingOPD: number | null,
  selectedDetailId: string | null | undefined,
  draftHasil: StatusHasilEvaluasi | null | undefined,
): string | null {
  if (!pengajuan) {
    return "Tidak ada pengajuan evaluasi aktif untuk OPD ini.";
  }
  const wajibSkorOpd = pengajuan.jenis !== "MANDIRI";
  if (
    wajibSkorOpd &&
    (ratingOPD === null || ratingOPD < 1 || ratingOPD > 5)
  ) {
    return "Isi skor evaluasi OPD (1–5) di tab Evaluasi OPD.";
  }
  if (pengajuan.nilaiPerDetail.length === 0) {
    return "Pengajuan belum memiliki daftar dokumen untuk dinilai.";
  }
  let jumlahBelumSesuai = 0;
  for (const row of pengajuan.nilaiPerDetail) {
    const effectiveHasil =
      selectedDetailId === row.detailSopId &&
      draftHasil !== null &&
      draftHasil !== undefined
        ? draftHasil
        : row.hasil;
    if (effectiveHasil !== STATUS_HASIL_EVALUASI.SESUAI) {
      jumlahBelumSesuai += 1;
    }
  }
  if (jumlahBelumSesuai > 0) {
    return `Masih ada ${jumlahBelumSesuai} SOP yang belum bernilai Sesuai (simpan per dokumen, tunggu konfirmasi simpan) sebelum mengajukan hasil ke PJ Evaluator.`;
  }
  return null;
}

export function buildAjukanEvaluasiSnapshotRows(
  pengajuan: EvaluasiWorkspacePengajuanAktif | null | undefined,
  judulByDetailId: Map<string, { judul: string; nomorSOP: string }>,
  selectedDetailId: string | null | undefined,
  draftHasil: StatusHasilEvaluasi | null | undefined,
): AjukanEvaluasiSnapshotRow[] {
  if (!pengajuan) {
    return [];
  }
  return pengajuan.nilaiPerDetail.map((row) => {
    const meta = judulByDetailId.get(row.detailSopId);
    const effectiveHasil =
      selectedDetailId === row.detailSopId &&
      draftHasil !== null &&
      draftHasil !== undefined
        ? draftHasil
        : row.hasil;
    let hasilLabel = "Belum dinilai";
    if (effectiveHasil === STATUS_HASIL_EVALUASI.SESUAI) {
      hasilLabel = "Sesuai";
    } else if (effectiveHasil === STATUS_HASIL_EVALUASI.PERLU_PERBAIKAN) {
      hasilLabel = "Perlu Perbaikan";
    }
    return {
      detailSopId: row.detailSopId,
      judul: meta?.judul ?? row.detailSopId.slice(0, 8) + "…",
      nomorSOP: meta?.nomorSOP ?? "—",
      hasilLabel,
    };
  });
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

export function useEvaluasiDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.evaluasiById(id),
    queryFn: () => evaluasiApi.findById(id),
    enabled: !!id,
    staleTime: STALE_TIME.MEDIUM,
  });
}

export function useIsiNilaiEvaluasi() {
  return useMutationWithToast({
    mutationFn: ({
      pengajuanEvaluasiId,
      sopDetailId,
      payload,
    }: IsiNilaiEvaluasiMutationDto) =>
      evaluasiApi.isiNilai(pengajuanEvaluasiId, sopDetailId, payload),
    invalidateKeys: [
      queryKeys.evaluasi,
      queryKeys.evaluasiWorkspaceOpdAll,
      queryKeys.evaluasiWorkspacePengajuanAll,
      queryKeys.evaluasiRingkasAll,
    ],
    successMessage: "Hasil evaluasi berhasil disimpan",
    errorMessagePrefix: "Gagal menyimpan hasil evaluasi",
  });
}

export function useSelesaiEvaluasi() {
  return useMutationWithToast({
    mutationFn: ({ pengajuanEvaluasiId, payload }: SelesaiEvaluasiMutationDto) =>
      evaluasiApi.selesai(pengajuanEvaluasiId, payload),
    invalidateKeys: [
      queryKeys.evaluasi,
      queryKeys.evaluasiWorkspaceOpdAll,
      queryKeys.evaluasiWorkspacePengajuanAll,
      queryKeys.evaluasiRingkasAll,
      queryKeys.evaluasiGrafikTahunan(undefined),
    ],
    successMessage: "Evaluasi berhasil diselesaikan",
    errorMessagePrefix: "Gagal menyelesaikan evaluasi",
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

  useEffect(() => {
    setStatusEvaluasiState(existingNilai?.hasil ?? null);
    setKomentarEvaluasiState(existingNilai?.catatan ?? "");
  }, [existingNilai?.hasil, existingNilai?.catatan, sopDetailId]);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSubmittedRef = useRef<string | null>(null);

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
    const existingHasil = existingNilai?.hasil ?? null;
    const existingCatatan = (existingNilai?.catatan ?? '').trim();
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
    pengajuanId,
    sopDetailId,
    isLoadingPengajuan,
    statusEvaluasi,
    komentarEvaluasi,
    saveDraftMutation,
    existingNilai?.hasil,
    existingNilai?.catatan,
    getCurrentVersion,
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

interface LastEvaluatedEntry {
  date: string;
  evaluatorName: string;
}

interface UseEvaluasiSubmitConfig {
  pengajuanAktifId: string | undefined;
  ratingOPD: number | null;
  /** false untuk pengajuan MANDIRI — PATCH selesai tanpa nilaiOPD. */
  requiresNilaiOpd: boolean;
  detailIdsInPengajuan: readonly string[];
  canSubmit: boolean;
  blockingMessage: string | null;
  namaEvaluator: string;
  setLastEvaluatedBy: Dispatch<
    SetStateAction<Record<string, LastEvaluatedEntry>>
  >;
  onSuccess?: () => void;
}

export function useEvaluasiSubmit(config: UseEvaluasiSubmitConfig) {
  const {
    pengajuanAktifId,
    ratingOPD,
    requiresNilaiOpd,
    detailIdsInPengajuan,
    canSubmit,
    blockingMessage,
    namaEvaluator,
    setLastEvaluatedBy,
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
      const now = new Date().toISOString();
      setLastEvaluatedBy((prev: Record<string, LastEvaluatedEntry>) => {
        const next = { ...prev };
        for (const id of detailIdsInPengajuan) {
          next[id] = { date: now, evaluatorName: namaEvaluator };
        }
        return next;
      });
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
    detailIdsInPengajuan,
    canSubmit,
    blockingMessage,
    namaEvaluator,
    setLastEvaluatedBy,
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
 * Hook to fetch evaluation history for a specific SOP.
 * Uses existing evaluasiApi.findAll to find completed evaluations.
 */
export function useRiwayatEvaluasiSop(sopDetailId: string): {
  data: RiwayatEvaluasiEntry[];
  isLoading: boolean;
} {
  const { list: pengajuanList, isLoading } = useEvaluasi({
    statusIn: [...STATUS_RIWAYAT_FINAL_EVALUASI],
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
    statusIn: [...STATUS_RIWAYAT_FINAL_EVALUASI],
  });

  const riwayat = useMemo(() => {
    if (!pengajuanList) return [];
    return pengajuanList
      .map((p) => ({
        tanggal: p.tanggalDiselesaikan ?? p.updatedAt,
        evaluator: p.diselesaikanOleh?.nama ?? "Unknown",
        hasil: "SESUAI" as const,
        nilaiOPD: p.nilaiOPD,
      }))
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [pengajuanList]);

  return { data: riwayat, isLoading };
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
        jenis: p.jenis,
        nilaiEvaluasi: p.nilaiPerDetail.map(
          (n): NilaiEvaluasi => ({
            id: `ws-${n.detailSopId}`,
            pengajuanEvaluasiId: p.id,
            sopDetailId: n.detailSopId,
            hasil: n.hasil ?? undefined,
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
    return pickPengajuanAktifUntukEvaluator(pengajuanList);
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
          jenis: activePengajuan.jenis ?? "TERJADWAL",
          nilaiEvaluasi: activePengajuan.nilaiEvaluasi ?? [],
        }
      : null,
    isLoading: fromWorkspace ? false : isLoading,
    error: fromWorkspace ? null : error,
    getCurrentVersion,
  };
}
