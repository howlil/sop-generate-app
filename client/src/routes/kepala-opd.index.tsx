import { createFileRoute, redirect } from '@tanstack/react-router'
import { ROUTES } from '@/utils/constants/ui'

export const Route = createFileRoute('/kepala-opd/')({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.KEPALA_OPD.PANTAU_SOP })
  },
  component: () => null,
})
