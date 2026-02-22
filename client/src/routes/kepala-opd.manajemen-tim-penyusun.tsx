import { createFileRoute } from '@tanstack/react-router'
import { ManajemenTimPenyusun } from '@/pages/kepala-opd/ManajemenTimPenyusun'

export const Route = createFileRoute('/kepala-opd/manajemen-tim-penyusun')({
  component: () => <ManajemenTimPenyusun />,
})
