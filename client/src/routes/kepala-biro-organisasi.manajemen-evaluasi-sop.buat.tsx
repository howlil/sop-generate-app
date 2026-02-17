import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/kepala-biro-organisasi/manajemen-evaluasi-sop/buat')({
  component: BuatPenugasanRedirect,
})

function BuatPenugasanRedirect() {
  return <Navigate to="/kepala-biro-organisasi/manajemen-evaluasi-sop" />
}
