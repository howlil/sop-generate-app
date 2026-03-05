import { createFileRoute } from '@tanstack/react-router'
import { InitiateProyekSOP } from '@/pages/kepala-opd/InitiateProyekSOP'

export const Route = createFileRoute('/tim-penyusun/initiate-proyek')({
  component: () => <InitiateProyekSOP />,
})
