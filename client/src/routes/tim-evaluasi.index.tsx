import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/tim-evaluasi/')({
  beforeLoad: () => {
    throw redirect({ to: '/tim-evaluasi/penugasan' })
  },
  component: () => null,
})
