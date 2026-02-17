import { createFileRoute } from '@tanstack/react-router'
import { ManajemenTimPenyusun } from '@/components/pages/kepala-opd/ManajemenTimPenyusun'

export const Route = createFileRoute('/kepala-opd/manajemen-tim-penyusun')({
  component: () => <ManajemenTimPenyusun />,
})
