import { createFileRoute } from '@tanstack/react-router'
import { ManajemenSOP } from '@/pages/tim-penyusun/ManajemenSOP'

export const Route = createFileRoute('/tim-penyusun/manajemen-sop')({
  component: () => <ManajemenSOP />,
})
