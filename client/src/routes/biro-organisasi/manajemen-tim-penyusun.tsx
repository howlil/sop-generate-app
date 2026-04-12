import { createFileRoute } from '@tanstack/react-router'
import { ManajemenTimPenyusun } from '@/pages/biro-organisasi/manajemen-tim-penyusun'

export const Route = createFileRoute('/biro-organisasi/manajemen-tim-penyusun')({
  component: () => <ManajemenTimPenyusun />,
})
