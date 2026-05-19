/**
 * Application Constants
 * Source of truth for all constants
 * Note: Types are imported from @/types/common
 */

import type { RoleKey } from "@/types/dto/access.dto";
import type { StatusBadgeConfig } from "@/types/ui/shared";
import {
  getHasilEvaluasiColors,
  getPengajuanStatusColors,
  getSopStatusColors,
  SOP_STATUS_FILTER_OPTIONS,
  STATUS_BADGE_COLORS_DEFAULT,
} from "@/lib/status";

// ==================== CONSTANTS ====================

export const LOCALE_ID = "id-ID" as const;

export const DEFAULT_PAGE_SIZE = 10 as const;

// ==================== QUERY DEFAULTS ====================

export const STALE_TIME = {
  SHORT: 2 * 60 * 1000, // Volatile data (detail SOP, drafts)
  MEDIUM: 5 * 60 * 1000, // Moderate changes (SOP lists, teams, OPD)
  LONG: 10 * 60 * 1000, // Data stabil (grafik tahunan, referensi)
} as const;

/** Konstanta string — sama dengan enum Prisma `PeranPengguna`. */
export const ROLES = {
  PJ_EVALUATOR: "PJ_EVALUATOR",
  EVALUATOR: "EVALUATOR",
  KEPALA_OPD: "KEPALA_OPD",
  PJ_PENYUSUN: "PJ_PENYUSUN",
  PENYUSUN: "PENYUSUN",
} as const;

export const ROLE_LABELS: Record<RoleKey, string> = {
  PJ_EVALUATOR: "PJ Evaluator",
  EVALUATOR: "Evaluator",
  KEPALA_OPD: "Kepala OPD",
  PJ_PENYUSUN: "PJ Penyusun",
  PENYUSUN: "Penyusun",
} as const;

export const ROUTES = {
  HOME: "/",
  /** Halaman publik verifikasi pengesahan TTE (scan QR, tanpa login). */
  VALIDASI: {
    PENGESAHAN_PREFIX: "/validasi/pengesahan",
  },
  AUTH: {
    LOGIN: "/login",
  },
  PENYUSUN: {
    ME: "/penyusun/me",
    SOP: "/penyusun/sop",
    DETAIL_SOP: "/penyusun/sop/$id",
    PELAKSANA: "/penyusun/pelaksana",
    PERATURAN: "/penyusun/peraturan",
    /** @deprecated redirect ke ME */
    PJ_PENYUSUN_TTE: "/penyusun/pj-penyusun/tte",
    PJ_PENYUSUN_BERITA_ACARA: "/penyusun/pj-penyusun/berita-acara",
    DETAIL_BERITA_ACARA: "/penyusun/pj-penyusun/berita-acara/$id",
  },
  KEPALA_OPD: {
    ME: "/kepala-opd/me",
    SOP: "/kepala-opd/sop",
    DETAIL_SOP: "/kepala-opd/sop/$id",
    PENGAJUAN: "/kepala-opd/pengajuan",
    DETAIL_PENGAJUAN: "/kepala-opd/pengajuan/$id",
    /** @deprecated redirect ke ME */
    TTE: "/kepala-opd/tte",
  },
  PJ_EVALUATOR: {
    ME: "/pj-evaluator/me",
    GRAFIK_EVALUASI: "/pj-evaluator/grafik-evaluasi",
    OPD: "/pj-evaluator/opd",
    PENYUSUN: "/pj-evaluator/penyusun",
    EVALUATOR: "/pj-evaluator/evaluator",
    EVALUASI: "/pj-evaluator/evaluasi",
    DETAIL_EVALUASI: "/pj-evaluator/evaluasi/$id",
    /** @deprecated redirect ke ME */
    TTE: "/pj-evaluator/tte",
  },
  /** Workspace peran EVALUATOR (bukan PJ dashboard). */
  EVALUATOR: {
    ME: "/evaluator/me",
    EVALUASI: "/evaluator/evaluasi",
    /** Bookmark lama (opdId) — redirect ke pengajuan aktif atau daftar terfilter. */
    DETAIL_EVALUASI_OPD: "/evaluator/evaluasi/$id",
    DETAIL_EVALUASI_PENGAJUAN: "/evaluator/evaluasi/pengajuan/$id",
  },
} as const;

export const EVALUASI_DISPLAY_STATUS_OPTIONS = [
  { value: "SESUAI", label: "Sesuai" },
  { value: "PERLU_PERBAIKAN", label: "Perlu Perbaikan" },
] as const;

export const IA = {
  NAV_BIRO_EVALUASI_TERJADWAL: "Evaluasi Terjadwal",
  NAV_BIRO_BATCH_BA: "Manajemen Evaluasi SOP",
  NAV_BIRO_VERIFIKASI_BA: "Verifikasi BA",
  NAV_TP_BA_KOORDINATOR: "Berita Acara PJ Penyusun",
  NAV_KO_BA_PENGESAHAN: "Berita Acara Pengesahan",
  NAV_TE_EVALUASI: "Evaluasi SOP",
  BERITA_ACARA: "Berita Acara",
  PENGAJUAN_EVALUASI_OPD: "Pengajuan evaluasi OPD",
  TERJADWAL_EVALUASI_OPD: "Terjadwal Evaluasi OPD",
  VERIFIKASI_BA_BIRO: "Verifikasi Berita Acara oleh PJ Evaluator",
  VERIFIKASI_BA_KOORDINATOR: "Verifikasi Berita Acara oleh PJ Penyusun",
  PENGESAHAN_SOP: "Pengesahan SOP",
} as const;

export const STATUS_BADGE_CONFIG = {
  AKTIF: { label: "Aktif", color: "text-green-700", bgColor: "bg-green-100" },
  NONAKTIF: {
    label: "Nonaktif",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
  DISETUJAI: {
    label: "Disetujui",
    color: "text-emerald-800",
    bgColor: "bg-emerald-100",
  },
  DITOLAK: {
    label: "Ditolak",
    color: "text-rose-800",
    bgColor: "bg-rose-100",
  },
} as const satisfies Record<string, StatusBadgeConfig>;

/** Lookup gabungan (legacy); utamakan badge per domain. */
export function getStatusBadgeColors(status: string) {
  const misc = STATUS_BADGE_CONFIG[status as keyof typeof STATUS_BADGE_CONFIG]
  if (misc) return { color: misc.color, bgColor: misc.bgColor }
  const pengajuan = getPengajuanStatusColors(status)
  if (pengajuan !== STATUS_BADGE_COLORS_DEFAULT) return pengajuan
  const sop = getSopStatusColors(status)
  if (sop !== STATUS_BADGE_COLORS_DEFAULT) return sop
  return getHasilEvaluasiColors(status)
}

export function getStatusBadgeConfig(status: string): StatusBadgeConfig {
  const misc = STATUS_BADGE_CONFIG[status as keyof typeof STATUS_BADGE_CONFIG]
  if (misc) return misc
  const colors = getStatusBadgeColors(status)
  return { label: status, ...colors }
}

export { SOP_STATUS_FILTER_OPTIONS };
