import { createFileRoute } from '@tanstack/react-router'
import { ManajemenTimPenyusun } from '@/pages/biro-organisasi/tim-penyusun/ManajemenTimPenyusun'

export const Route = createFileRoute('/biro-organisasi/tim-penyusun/')({
  component: ManajemenTimPenyusun,
})
