import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/kepala-opd/')({
  beforeLoad: () => {
    throw redirect({ to: '/kepala-opd/daftar-sop' })
  },
  component: () => null,
})
