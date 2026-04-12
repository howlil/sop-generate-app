import { createFileRoute } from '@tanstack/react-router'
import { PelaksanaSOP } from '@/pages/tim-penyusun/pelaksana-sop'

export const Route = createFileRoute('/tim-penyusun/pelaksana-sop')({
  component: PelaksanaSOP,
})
