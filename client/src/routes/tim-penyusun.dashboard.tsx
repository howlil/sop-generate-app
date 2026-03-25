import { createFileRoute } from '@tanstack/react-router'
import { TimPenyusunDashboard } from '@/pages/tim-penyusun/TimPenyusunDashboard'

export const Route = createFileRoute('/tim-penyusun/dashboard')({
  component: () => <TimPenyusunDashboard />,
})
