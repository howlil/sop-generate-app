import { createFileRoute } from '@tanstack/react-router'
import { ManajemenOPD } from '@/pages/biro-organisasi/opd/ManajemenOPD'

export const Route = createFileRoute('/biro-organisasi/opd/')({
  component: ManajemenOPD,
})
