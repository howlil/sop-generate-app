import { createFileRoute } from '@tanstack/react-router'
import { ManajemenTimPenyusun } from '@/pages/kepala-biro-organisasi/ManajemenTimPenyusun'

export const Route = createFileRoute('/biro-organisasi/manajemen-tim-penyusun')({
  component: () => <ManajemenTimPenyusun />,
})
