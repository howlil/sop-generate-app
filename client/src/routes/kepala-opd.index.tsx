import { createFileRoute, redirect } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants/routes'

export const Route = createFileRoute('/kepala-opd/')({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.KEPALA_OPD.TTD })
  },
  component: () => null,
})
