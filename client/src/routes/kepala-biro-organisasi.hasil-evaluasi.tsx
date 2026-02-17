import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/kepala-biro-organisasi/hasil-evaluasi')({
  beforeLoad: () => {
    throw redirect({ to: '/kepala-biro-organisasi/manajemen-evaluasi-sop' })
  },
  component: () => null,
})
