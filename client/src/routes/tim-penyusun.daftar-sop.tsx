import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/tim-penyusun/daftar-sop')({
  beforeLoad: () => {
    throw redirect({ to: '/tim-penyusun/manajemen-sop' })
  },
  component: () => null,
})
