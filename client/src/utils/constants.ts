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
  LONG: 10 * 60 * 1000, // Stable data (rekap, reference data)
} as const;

export const ROLES = {
  BIRO_ORGANISASI: "BIRO_ORGANISASI",
  TIM_PENYUSUN: "TIM_PENYUSUN",
  KOORDINATOR_TIM_PENYUSUN: "KOORDINATOR_TIM_PENYUSUN",
  KEPALA_OPD: "KEPALA_OPD",
  TIM_EVALUASI: "TIM_EVALUASI",
} as const;

export const ROLE_LABELS: Record<RoleKey, string> = {
  BIRO_ORGANISASI: "Biro Organisasi",
  TIM_PENYUSUN: "Tim Penyusun",
  KOORDINATOR_TIM_PENYUSUN: "Koordinator Tim Penyusun",
  KEPALA_OPD: "Kepala OPD",
  TIM_EVALUASI: "Tim Evaluasi",
} as const;

export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
  },
  TIM_PENYUSUN: {
    SOP: "/tim-penyusun/sop",
    DETAIL_SOP: "/tim-penyusun/sop/$id",
    PELAKSANA: "/tim-penyusun/pelaksana",
    PERATURAN: "/tim-penyusun/peraturan",
    KOORDINATOR_TTE: "/tim-penyusun/koordinator/tte",
    KOORDINATOR_BERITA_ACARA: "/tim-penyusun/koordinator/berita-acara",
    DETAIL_BERITA_ACARA: "/tim-penyusun/koordinator/berita-acara/$id",
  },
  KEPALA_OPD: {
    SOP: "/kepala-opd/sop",
    DETAIL_SOP: "/kepala-opd/sop/$id",
    TTE: "/kepala-opd/tte",
  },
  BIRO_ORGANISASI: {
    GRAFIK_EVALUASI: "/biro-organisasi/grafik-evaluasi",
    OPD: "/biro-organisasi/opd",
    TIM_PENYUSUN: "/biro-organisasi/tim-penyusun",
    TIM_EVALUASI: "/biro-organisasi/tim-evaluasi",
    EVALUASI: "/biro-organisasi/evaluasi",
    DETAIL_EVALUASI: "/biro-organisasi/evaluasi/$id",
    TTE: "/biro-organisasi/tte",
  },
  TIM_EVALUASI: {
    EVALUASI: "/tim-evaluasi/evaluasi",
    DETAIL_EVALUASI_OPD: "/tim-evaluasi/evaluasi/$id",
  },
  VALIDASI: {
    TTD_BERHASIL: "/validasi/ttd-berhasil",
    PENGESAHAN: "/validasi/pengesahan/$id",
  },
} as const;

export const EVALUASI_DISPLAY_STATUS_OPTIONS = [
  { value: "SESUAI", label: "Sesuai" },
  { value: "TIDAK_SESUAI", label: "Tidak Sesuai" },
] as const;

export const IA = {
  NAV_BIRO_EVALUASI_TERJADWAL: "Evaluasi Terjadwal",
  NAV_BIRO_BATCH_BA: "Manajemen Evaluasi SOP",
  NAV_BIRO_VERIFIKASI_BA: "Verifikasi BA",
  NAV_TP_BA_KOORDINATOR: "Berita Acara Koordinator",
  NAV_KO_BA_PENGESAHAN: "Berita Acara Pengesahan",
  NAV_TE_EVALUASI: "Evaluasi SOP",
  BERITA_ACARA: "Berita Acara",
  BATCH_EVALUASI_OPD: "Batch Evaluasi OPD",
  TERJADWAL_EVALUASI_OPD: "Terjadwal Evaluasi OPD",
  VERIFIKASI_BA_BIRO: "Verifikasi Berita Acara oleh Biro",
  VERIFIKASI_BA_KOORDINATOR: "Verifikasi Berita Acara oleh Koordinator",
  PENGESAHAN_SOP: "Pengesahan SOP",
} as const;

export const STATUS_BADGE_CONFIG = {
  DRAFT: { label: "Draft", color: "text-gray-700", bgColor: "bg-gray-100" },
  SEDANG_DISUSUN: {
    label: "Sedang Disusun",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  SIAP_DIEVALUASI: {
    label: "Siap Dievaluasi",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  DIAJUKAN_EVALUASI: {
    label: "Diajukan Evaluasi",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  SEDANG_DIEVALUASI: {
    label: "Sedang Dievaluasi",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  REVISI_DARI_TIM_EVALUASI: {
    label: "Revisi",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  SIAP_DIVERIFIKASI: {
    label: "Siap Diverifikasi",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  DIVERIFIKASI_BIRO_ORGANISASI: {
    label: "Diverifikasi",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  AKTIF: { label: "Aktif", color: "text-green-700", bgColor: "bg-green-100" },
  NONAKTIF: {
    label: "Nonaktif",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
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
