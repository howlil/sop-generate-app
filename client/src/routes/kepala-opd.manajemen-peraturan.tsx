import { createFileRoute } from '@tanstack/react-router'
import { ManajemenPeraturan } from '@/components/pages/kepala-opd/ManajemenPeraturan'

export const Route = createFileRoute('/kepala-opd/manajemen-peraturan')({
  component: () => <ManajemenPeraturan />,
})
