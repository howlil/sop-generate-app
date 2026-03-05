import { createFileRoute } from '@tanstack/react-router'
import { ManajemenPeraturan } from '@/pages/kepala-opd/ManajemenPeraturan'

export const Route = createFileRoute('/tim-penyusun/manajemen-peraturan')({
  component: () => <ManajemenPeraturan />,
})
