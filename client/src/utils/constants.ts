/**
 * Application Constants
 * Source of truth for all constants
 * Note: Types are imported from @/types/common
 */

import type { RoleKey } from "@/types/dto/access.dto";
import type { StatusSOP } from "@/types/dto/sop.dto";
import type { StatusBadgeConfig } from "@/types/ui/shared";

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
    SOP: "/penyusun/sop",
    DETAIL_SOP: "/penyusun/sop/$id",
    PELAKSANA: "/penyusun/pelaksana",
    PERATURAN: "/penyusun/peraturan",
    PJ_PENYUSUN_TTE: "/penyusun/pj-penyusun/tte",
    PJ_PENYUSUN_BERITA_ACARA: "/penyusun/pj-penyusun/berita-acara",
    DETAIL_BERITA_ACARA: "/penyusun/pj-penyusun/berita-acara/$id",
  },
  KEPALA_OPD: {
    SOP: "/kepala-opd/sop",
    DETAIL_SOP: "/kepala-opd/sop/$id",
    PENGAJUAN: "/kepala-opd/pengajuan",
    DETAIL_PENGAJUAN: "/kepala-opd/pengajuan/$id",
    TTE: "/kepala-opd/tte",
  },
  PJ_EVALUATOR: {
    GRAFIK_EVALUASI: "/pj-evaluator/grafik-evaluasi",
    OPD: "/pj-evaluator/opd",
    PENYUSUN: "/pj-evaluator/penyusun",
    EVALUATOR: "/pj-evaluator/evaluator",
    EVALUASI: "/pj-evaluator/evaluasi",
    DETAIL_EVALUASI: "/pj-evaluator/evaluasi/$id",
    TTE: "/pj-evaluator/tte",
  },
  /** Workspace peran EVALUATOR (bukan PJ dashboard). */
  EVALUATOR: {
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
  BATCH_EVALUASI_OPD: "Batch Evaluasi OPD",
  TERJADWAL_EVALUASI_OPD: "Terjadwal Evaluasi OPD",
  VERIFIKASI_BA_BIRO: "Verifikasi Berita Acara oleh PJ Evaluator",
  VERIFIKASI_BA_KOORDINATOR: "Verifikasi Berita Acara oleh PJ Penyusun",
  PENGESAHAN_SOP: "Pengesahan SOP",
} as const;

export const STATUS_BADGE_CONFIG = {
  DRAFT: { label: "Draft", color: "text-gray-700", bgColor: "bg-gray-100" },
  SEDANG_DISUSUN: {
    label: "Sedang Disusun",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
  },
  SIAP_DIEVALUASI: {
    label: "Siap Dievaluasi",
    color: "text-cyan-800",
    bgColor: "bg-cyan-100",
  },
  DIAJUKAN_EVALUASI: {
    label: "Diajukan Evaluasi",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  SEDANG_DIEVALUASI: {
    label: "Sedang Dievaluasi",
    color: "text-amber-800",
    bgColor: "bg-amber-100",
  },
  REVISI_DARI_EVALUATOR: {
    label: "Perlu revisi (evaluator)",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  SIAP_DIVERIFIKASI: {
    label: "Siap Diverifikasi",
    color: "text-teal-800",
    bgColor: "bg-teal-100",
  },
  DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI: {
    label: "Diverifikasi PJ Evaluator",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  BERLAKU: {
    label: "Berlaku",
    color: "text-emerald-800",
    bgColor: "bg-emerald-100",
  },
  DICABUT: {
    label: "Dicabut",
    color: "text-rose-800",
    bgColor: "bg-rose-100",
  },
  AKTIF: { label: "Aktif", color: "text-green-700", bgColor: "bg-green-100" },
  NONAKTIF: {
    label: "Nonaktif",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
  /** Status Berita Acara PJ Penyusun (bukan enum StatusSOP). */
  DIVERIFIKASI_PJ_EVALUATOR: {
    label: "Diverifikasi PJ Evaluator",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  DITANDATANGANI_PJ_PENYUSUN: {
    label: "Ditandatangani PJ Penyusun",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  SELESAI_DIEVALUASI: {
    label: "Selesai Dievaluasi",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  SELESAI: {
    label: "Selesai",
    color: "text-emerald-800",
    bgColor: "bg-emerald-100",
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
  /** Label workspace evaluator (bukan enum StatusSOP). */
  "Diajukan Evaluasi": {
    label: "Diajukan Evaluasi",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  "Sedang Dievaluasi": {
    label: "Sedang Dievaluasi",
    color: "text-amber-800",
    bgColor: "bg-amber-100",
  },
  "Selesai Evaluasi": {
    label: "Selesai Evaluasi",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  default: { label: "Unknown", color: "text-gray-700", bgColor: "bg-gray-100" },
} as const satisfies Record<string, StatusBadgeConfig>;

export function getStatusBadgeConfig(
  status: StatusSOP | "AKTIF" | "NONAKTIF" | string,
): StatusBadgeConfig {
  return (
    STATUS_BADGE_CONFIG[status as keyof typeof STATUS_BADGE_CONFIG] ||
    STATUS_BADGE_CONFIG["default"]
  );
}
