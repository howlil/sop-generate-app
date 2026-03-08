import { createFileRoute } from '@tanstack/react-router'
import { PelaksanaSOP } from '@/pages/tim-penyusun/PelaksanaSOP'

export const Route = createFileRoute('/tim-penyusun/pelaksana-sop')({
  component: PelaksanaSOP,
})
