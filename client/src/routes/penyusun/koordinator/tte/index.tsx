import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from "@/pages/pj-evaluator/tte/TTDElektronikPage";
import { requireRoles } from '@/stores/authStore'

export const Route = createFileRoute('/penyusun/koordinator/tte/')({
  beforeLoad: requireRoles(['PJ_PENYUSUN']),
  component: PjPenyusunTtePage,
})

function PjPenyusunTtePage() {
  return (
    <TTDElektronikPage
      role="pj-penyusun"
    />
  )
}
