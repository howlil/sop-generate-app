import { lazy, Suspense } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { RouteErrorPage } from '@/components/ui/route-error'
import { ROLES, ROUTES } from '@/utils/constants'
import { getRole, ensureAuthHydrated } from '@/stores/authStore'

const homeSearchSchema = z.object({
  denied: z.coerce.boolean().optional(),
  redirect: z.string().max(2048).optional(),
})

const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })),
)

function HomeRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center text-sm text-gray-600">Memuat beranda…</div>
        </div>
      }
    >
      <LandingPage />
    </Suspense>
  )
}

export const Route = createFileRoute('/')({
  validateSearch: zodSearchValidator(homeSearchSchema),
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
  component: HomeRoutePage,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
})
