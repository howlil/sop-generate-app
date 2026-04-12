/**
 * Hook akses role & helpers — satu titik akses untuk UI.
 * Uses Zustand selectors with shallow comparison for optimal performance.
 */
import { useAuthStore } from "@/stores/authStore";
import { ROLES, ROLE_LABELS } from "@/utils/constants";
import type { RoleKey } from "@/types/common";

export { ROLES };

export function useAppRole() {
  const user = useAuthStore((state) => state.user);
  const role = user?.peran as RoleKey | undefined;

  const getRoleLabel = (r: RoleKey) => ROLE_LABELS[r] ?? r;
  const getRoleNip = () => user?.nip ?? "";
  const getRoleUserName = () => user?.nama ?? "";
  const getRoleDisplayName = () => user?.nama ?? "";

  return {
    role,
    user,
    getRoleLabel,
    getRoleNip,
    getRoleUserName,
    getRoleDisplayName,
    isBiroOrganisasi: role === ROLES.BIRO_ORGANISASI,
    isKepalaOPD: role === ROLES.KEPALA_OPD,
    isTimEvaluasi: role === ROLES.TIM_EVALUASI,
    isTimPenyusun: role === ROLES.TIM_PENYUSUN,
    isKoordinator: role === "KOORDINATOR_TIM_PENYUSUN",
  };
}
