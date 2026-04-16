import { createFileRoute } from '@tanstack/react-router'
import { PantauSOP } from '@/pages/kepala-opd/sop'

export const Route = createFileRoute('/kepala-opd/sop/')({
  component: PantauSOP,
})
