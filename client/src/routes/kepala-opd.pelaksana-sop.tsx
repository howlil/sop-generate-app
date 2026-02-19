import { createFileRoute } from '@tanstack/react-router'
import { PelaksanaSOPPage } from '@/components/pages/kepala-opd/PelaksanaSOP'

export const Route = createFileRoute('/kepala-opd/pelaksana-sop')({
  component: () => <PelaksanaSOPPage />,
})

