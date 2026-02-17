import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/tim-penyusun/')({
  beforeLoad: () => {
    throw redirect({ to: '/tim-penyusun/sop-saya' })
  },
  component: () => null,
})
