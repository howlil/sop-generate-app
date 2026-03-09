import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/tim-evaluasi/evaluasi')({
  component: () => <Outlet />,
})
