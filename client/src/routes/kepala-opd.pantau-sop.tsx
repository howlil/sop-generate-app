import { createFileRoute } from '@tanstack/react-router'
import { PantauSOP } from '@/pages/kepala-opd/PantauSOP'

export const Route = createFileRoute('/kepala-opd/pantau-sop')({
  component: PantauSOP,
})
