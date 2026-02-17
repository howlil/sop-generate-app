import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/kepala-biro-organisasi/manajemen-evaluasi-sop')({
  component: ManajemenEvaluasiSOPLayout,
})

function ManajemenEvaluasiSOPLayout() {
  return <Outlet />
}
