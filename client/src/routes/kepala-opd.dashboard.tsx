import { createFileRoute } from '@tanstack/react-router'
import { KepalaOpdDashboard } from '@/pages/kepala-opd/KepalaOpdDashboard'

export const Route = createFileRoute('/kepala-opd/dashboard')({
  component: () => <KepalaOpdDashboard />,
})
