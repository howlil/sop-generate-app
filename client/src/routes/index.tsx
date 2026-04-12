import { createFileRoute, redirect } from '@tanstack/react-router'
import { LandingPage } from '@/pages/LandingPage'
import { ROLES, ROUTES } from '@/utils/constants'
import { getRole, ensureAuthHydrated } from '@/stores/authStore'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    await ensureAuthHydrated();
    const userRole = getRole()
    if (!userRole) {
      // Unauthenticated users see landing page
      return
    }
    // Redirect authenticated users to role-specific dashboard
    const roleDashboards: Record<string, string> = {
      [ROLES.BIRO_ORGANISASI]: ROUTES.BIRO_ORGANISASI.GRAFIK_EVALUASI_TAHUNAN,
      [ROLES.TIM_PENYUSUN]: ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP,
      [ROLES.KOORDINATOR_TIM_PENYUSUN]: ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP,
      [ROLES.KEPALA_OPD]: ROUTES.KEPALA_OPD.PANTAU_SOP,
      [ROLES.TIM_EVALUASI]: ROUTES.TIM_EVALUASI.EVALUASI,
    }
    const targetRoute = roleDashboards[userRole]
    if (targetRoute) {
      throw redirect({ to: targetRoute })
    }
  },
  component: LandingPage,
})
