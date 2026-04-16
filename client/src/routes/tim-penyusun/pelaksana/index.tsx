import { createFileRoute } from '@tanstack/react-router'
import { PelaksanaSOP } from '@/pages/tim-penyusun/pelaksana'

export const Route = createFileRoute('/tim-penyusun/pelaksana/')({
  component: PelaksanaSOP,
})
