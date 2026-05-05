import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from "@/pages/pj-evaluator/tte/TTDElektronikPage";

export const Route = createFileRoute('/kepala-opd/tte/')({
  component: KepalaOpdTTEPage,
})

function KepalaOpdTTEPage() {
  return (
    <TTDElektronikPage
      role="kepala-opd"
    />
  )
}
