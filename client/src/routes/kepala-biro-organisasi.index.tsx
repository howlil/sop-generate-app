import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/kepala-biro-organisasi/')({
  component: KepalaBiroOrganisasiIndex,
})

function KepalaBiroOrganisasiIndex() {
  return <Navigate to="/kepala-biro-organisasi/manajemen-opd" />
}
