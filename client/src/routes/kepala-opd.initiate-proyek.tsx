import { createFileRoute } from '@tanstack/react-router'
import { InitiateProyekSOP } from '@/pages/kepala-opd/InitiateProyekSOP'

export const Route = createFileRoute('/kepala-opd/initiate-proyek')({
  component: () => <InitiateProyekSOP />,
})
