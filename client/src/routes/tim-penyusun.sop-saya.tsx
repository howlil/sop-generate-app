import { createFileRoute } from '@tanstack/react-router'
import { SOPSaya } from '@/pages/tim-penyusun/SOPSaya'

export const Route = createFileRoute('/tim-penyusun/sop-saya')({
  component: () => <SOPSaya />,
})
