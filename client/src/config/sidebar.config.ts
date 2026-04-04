/**
 * Sidebar Configuration for all roles
 * Centralized sidebar menu definitions
 */

import type { RoleKey } from '@/types/common'
import type { SidebarItem } from '@/components/layout/RoleLayout'
import {
  BarChart3,
  Building2,
  FileCheck,
  PenLine,
  UserPlus,
  Users,
  BookOpen,
  FileSignature,
  FileText,
  UserCog,
} from 'lucide-react'
import { ROUTES, routePathPrefixForMatch } from '@/utils/constants'
import { IA } from '@/utils/constants'

type SidebarActiveConfig = Record<string, string[]>

/**
 * Convert SidebarActiveConfig (Record) to a function expected by RoleLayout
 */
export function createIsActiveFromConfig(config: SidebarActiveConfig) {
  return (pathname: string, item: SidebarItem): boolean => {
    const routes = config[item.to as string]
    if (!routes) return pathname === item.to
    return routes.some((route) => pathname.startsWith(route.replace('/$id', '')))
  }
}

/**
 * Sidebar items per role
 */
export const sidebarConfig: Record<RoleKey, SidebarItem[]> = {
  BIRO_ORGANISASI: [
    { to: ROUTES.BIRO_ORGANISASI.GRAFIK_EVALUASI_TAHUNAN, label: 'Grafik Evaluasi Tahunan', icon: BarChart3 },
    { to: ROUTES.BIRO_ORGANISASI.OPD, label: 'Manajemen OPD', icon: Building2 },
    { to: ROUTES.BIRO_ORGANISASI.TIM_PENYUSUN, label: 'Manajemen Tim Penyusun', icon: UserPlus },
    { to: ROUTES.BIRO_ORGANISASI.TIM_EVALUASI, label: 'Manajemen Tim Evaluasi', icon: Users },
    { to: ROUTES.BIRO_ORGANISASI.EVALUASI_SOP, label: IA.NAV_BIRO_BATCH_BA, icon: FileCheck },
    { to: ROUTES.BIRO_ORGANISASI.TTD, label: 'TTD Elektronik', icon: PenLine },
  ],

  TIM_PENYUSUN: [
    { to: ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP, label: 'Manajemen SOP', icon: FileText },
    { to: ROUTES.TIM_PENYUSUN.PELAKSANA_SOP, label: 'Kelola Pelaksana SOP', icon: UserCog },
    { to: ROUTES.TIM_PENYUSUN.PERATURAN, label: 'Manajemen Peraturan', icon: BookOpen },
    { to: ROUTES.TIM_PENYUSUN.BERITA_ACARA, label: IA.NAV_TP_BA_KOORDINATOR, icon: FileSignature },
    { to: ROUTES.TIM_PENYUSUN.TTD, label: 'TTD Elektronik', icon: PenLine },
  ],

  KEPALA_OPD: [
    { to: ROUTES.KEPALA_OPD.PANTAU_SOP, label: 'Pantau SOP', icon: FileText },
    { to: ROUTES.KEPALA_OPD.BERITA_ACARA, label: IA.NAV_KO_BA_PENGESAHAN, icon: FileCheck },
    { to: ROUTES.KEPALA_OPD.TTD, label: 'TTD Elektronik', icon: PenLine },
  ],

  TIM_EVALUASI: [
    { to: ROUTES.TIM_EVALUASI.EVALUASI_SOP, label: IA.NAV_TE_EVALUASI, icon: FileCheck },
    { to: ROUTES.TIM_EVALUASI.DETAIL_EVALUASI_OPD, label: 'Detail Evaluasi', icon: FileText },
  ],

  KOORDINATOR_TIM_PENYUSUN: [
    { to: ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP, label: 'Manajemen SOP', icon: FileText },
    { to: ROUTES.TIM_PENYUSUN.PELAKSANA_SOP, label: 'Kelola Pelaksana SOP', icon: UserCog },
    { to: ROUTES.TIM_PENYUSUN.PERATURAN, label: 'Manajemen Peraturan', icon: BookOpen },
    { to: ROUTES.TIM_PENYUSUN.BERITA_ACARA, label: IA.NAV_TP_BA_KOORDINATOR, icon: FileSignature },
    { to: ROUTES.TIM_PENYUSUN.TTD, label: 'TTD Elektronik', icon: PenLine },
  ],
}

/**
 * Active state matcher config per role
 * Defines which routes should highlight which sidebar items
 */
export const sidebarActiveConfig: Record<RoleKey, SidebarActiveConfig> = {
  BIRO_ORGANISASI: {
    [ROUTES.BIRO_ORGANISASI.GRAFIK_EVALUASI_TAHUNAN]: [ROUTES.BIRO_ORGANISASI.GRAFIK_EVALUASI_TAHUNAN],
    [ROUTES.BIRO_ORGANISASI.OPD]: [ROUTES.BIRO_ORGANISASI.OPD],
    [ROUTES.BIRO_ORGANISASI.TIM_PENYUSUN]: [ROUTES.BIRO_ORGANISASI.TIM_PENYUSUN],
    [ROUTES.BIRO_ORGANISASI.TIM_EVALUASI]: [ROUTES.BIRO_ORGANISASI.TIM_EVALUASI],
    [ROUTES.BIRO_ORGANISASI.EVALUASI_SOP]: [
      ROUTES.BIRO_ORGANISASI.EVALUASI_SOP,
      routePathPrefixForMatch(ROUTES.BIRO_ORGANISASI.DETAIL_EVALUASI),
    ],
    [ROUTES.BIRO_ORGANISASI.TTD]: [ROUTES.BIRO_ORGANISASI.TTD],
    [ROUTES.BIRO_ORGANISASI.DETAIL_SOP]: [
      ROUTES.BIRO_ORGANISASI.DETAIL_SOP,
      routePathPrefixForMatch(ROUTES.BIRO_ORGANISASI.DETAIL_SOP),
    ],
  },

  TIM_PENYUSUN: {
    [ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP]: [
      ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP,
      routePathPrefixForMatch(ROUTES.TIM_PENYUSUN.DETAIL_SOP),
    ],
    [ROUTES.TIM_PENYUSUN.PELAKSANA_SOP]: [ROUTES.TIM_PENYUSUN.PELAKSANA_SOP],
    [ROUTES.TIM_PENYUSUN.BERITA_ACARA]: [ROUTES.TIM_PENYUSUN.BERITA_ACARA],
    [ROUTES.TIM_PENYUSUN.TTD]: [ROUTES.TIM_PENYUSUN.TTD],
  },

  KEPALA_OPD: {
    [ROUTES.KEPALA_OPD.TTD]: [ROUTES.KEPALA_OPD.TTD],
    [ROUTES.KEPALA_OPD.BERITA_ACARA]: [ROUTES.KEPALA_OPD.BERITA_ACARA],
    [ROUTES.KEPALA_OPD.PANTAU_SOP]: [
      ROUTES.KEPALA_OPD.PANTAU_SOP,
      routePathPrefixForMatch(ROUTES.KEPALA_OPD.DETAIL_SOP),
    ],
  },

  TIM_EVALUASI: {
    [ROUTES.TIM_EVALUASI.EVALUASI_SOP]: [
      ROUTES.TIM_EVALUASI.EVALUASI_SOP,
      routePathPrefixForMatch(ROUTES.TIM_EVALUASI.EVALUASI),
    ],
    [ROUTES.TIM_EVALUASI.DETAIL_EVALUASI_OPD]: [ROUTES.TIM_EVALUASI.DETAIL_EVALUASI_OPD],
  },

  KOORDINATOR_TIM_PENYUSUN: {
    [ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP]: [
      ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP,
      routePathPrefixForMatch(ROUTES.TIM_PENYUSUN.DETAIL_SOP),
    ],
    [ROUTES.TIM_PENYUSUN.PELAKSANA_SOP]: [ROUTES.TIM_PENYUSUN.PELAKSANA_SOP],
    [ROUTES.TIM_PENYUSUN.BERITA_ACARA]: [ROUTES.TIM_PENYUSUN.BERITA_ACARA],
    [ROUTES.TIM_PENYUSUN.TTD]: [ROUTES.TIM_PENYUSUN.TTD],
  },
}
