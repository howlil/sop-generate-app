import { createFileRoute, redirect } from '@tanstack/react-router'
import { LandingPage } from '@/pages'
import { ROLES, ROUTES } from '@/utils/constants'
import { getRole, ensureAuthHydrated } from '@/stores/authStore'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    await ensureAuthHydrated()
    const userRole = getRole()
    if (!userRole) {
      return
    }
    const roleDashboards: Record<string, string> = {
      [ROLES.BIRO_ORGANISASI]: ROUTES.BIRO_ORGANISASI.GRAFIK_EVALUASI,
      [ROLES.TIM_PENYUSUN]: ROUTES.TIM_PENYUSUN.SOP,
      [ROLES.KOORDINATOR_TIM_PENYUSUN]: ROUTES.TIM_PENYUSUN.SOP,
      [ROLES.KEPALA_OPD]: ROUTES.KEPALA_OPD.SOP,
      [ROLES.TIM_EVALUASI]: ROUTES.TIM_EVALUASI.EVALUASI,
    }
    const targetRoute = roleDashboards[userRole]
    if (targetRoute) {
      throw redirect({ to: targetRoute })
    }
  },
  component: LandingPage,
})
