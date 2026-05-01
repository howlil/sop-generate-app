import { Link, Outlet, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
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
} from "lucide-react";
import logoSvg from "@/assets/logo.svg";
import { HeaderBar } from "@/components/layout/HeaderBar";
import { PageHeaderProvider } from "@/components/layout/PageHeaderProvider";
import { useAuthStore } from "@/stores/authStore";
import type { RoleKey } from "@/types/dto/access.dto";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/utils/constants";

interface SidebarItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const SIDEBAR_ITEMS: Record<RoleKey, SidebarItem[]> = {
  BIRO_ORGANISASI: [
    {
      to: ROUTES.BIRO_ORGANISASI.GRAFIK_EVALUASI,
      label: "Grafik Evaluasi",
      icon: BarChart3,
    },
    {
      to: ROUTES.BIRO_ORGANISASI.OPD,
      label: "Manajemen OPD",
      icon: Building2,
    },
    {
      to: ROUTES.BIRO_ORGANISASI.TIM_PENYUSUN,
      label: "Manajemen Tim Penyusun",
      icon: UserPlus,
    },
    {
      to: ROUTES.BIRO_ORGANISASI.TIM_EVALUASI,
      label: "Manajemen Tim Evaluasi",
      icon: Users,
    },
    {
      to: ROUTES.BIRO_ORGANISASI.EVALUASI,
      label: "Manajemen Evaluasi SOP",
      icon: FileCheck,
    },
    {
      to: ROUTES.BIRO_ORGANISASI.TTE,
      label: "TTD Elektronik",
      icon: PenLine,
    },
  ],
  TIM_PENYUSUN: [
    {
      to: ROUTES.TIM_PENYUSUN.SOP,
      label: "Manajemen SOP",
      icon: FileText,
    },
    {
      to: ROUTES.TIM_PENYUSUN.PELAKSANA,
      label: "Kelola Pelaksana SOP",
      icon: UserCog,
    },
    {
      to: ROUTES.TIM_PENYUSUN.PERATURAN,
      label: "Manajemen Peraturan",
      icon: BookOpen,
    },
  ],
  KOORDINATOR_TIM_PENYUSUN: [
    {
      to: ROUTES.TIM_PENYUSUN.SOP,
      label: "Manajemen SOP",
      icon: FileText,
    },
    {
      to: ROUTES.TIM_PENYUSUN.PELAKSANA,
      label: "Kelola Pelaksana SOP",
      icon: UserCog,
    },
    {
      to: ROUTES.TIM_PENYUSUN.PERATURAN,
      label: "Manajemen Peraturan",
      icon: BookOpen,
    },
    {
      to: ROUTES.TIM_PENYUSUN.KOORDINATOR_BERITA_ACARA,
      label: "Berita Acara Koordinator",
      icon: FileSignature,
    },
    {
      to: ROUTES.TIM_PENYUSUN.KOORDINATOR_TTE,
      label: "TTD Elektronik",
      icon: PenLine,
    },
  ],
  KEPALA_OPD: [
    { to: ROUTES.KEPALA_OPD.SOP, label: "Pantau SOP", icon: FileText },
    {
      to: ROUTES.KEPALA_OPD.TTE,
      label: "TTD Elektronik",
      icon: PenLine,
    },
  ],
  TIM_EVALUASI: [
    { to: ROUTES.TIM_EVALUASI.EVALUASI, label: "Evaluasi SOP", icon: FileCheck },
  ],
};

function isActivePath(pathname: string, itemTo: string): boolean {
  return pathname.startsWith(itemTo.replace("/$id", ""));
}

export function DashboardLayout() {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const sidebarItems = SIDEBAR_ITEMS[user?.peran as RoleKey] ?? [];

  return (
    <div className="flex h-[100dvh] flex-col md:flex-row md:h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Mobile nav */}
      <nav
        className="md:hidden flex shrink-0 items-stretch gap-0 border-b border-gray-200 bg-white px-2 py-2"
        aria-label="Navigasi utama"
      >
        <div className="flex items-center pr-2 border-r border-gray-100">
          <img src={logoSvg} alt="Logo" className="w-9 h-9" />
        </div>
        <div className="flex-1 flex overflow-x-auto gap-1 min-w-0 scrollbar-hide">
          {sidebarItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors flex items-center gap-1.5",
                isActivePath(pathname, to)
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-14 bg-white border-r border-gray-200 flex-col flex-shrink-0">
        <div className="p-2 flex flex-col items-center">
          <img src={logoSvg} alt="Logo" className="w-9 h-9" />
        </div>
        <nav
          className="flex-1 flex flex-col items-center gap-1 pt-4"
          aria-label="Navigasi ikon"
        >
          {sidebarItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-md transition-all",
                isActivePath(pathname, to)
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100 text-gray-600",
              )}
              title={label}
              aria-label={label}
            >
              <Icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <PageHeaderProvider>
          <HeaderBar />
          <main
            id="main-content"
            className="flex-1 overflow-auto scrollbar-hide p-3 sm:p-4 md:p-6 bg-white relative"
          >
            <Outlet />
          </main>
        </PageHeaderProvider>
      </div>
    </div>
  );
}
