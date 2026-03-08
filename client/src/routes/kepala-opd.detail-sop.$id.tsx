import { createFileRoute } from '@tanstack/react-router'
import { DetailSOP } from '@/pages/kepala-opd/DetailSOP'
import { ROUTES } from '@/lib/constants/routes'

export const Route = createFileRoute('/kepala-opd/detail-sop/$id')({
  component: KepalaOPDDetailSOPPage,
})

function KepalaOPDDetailSOPPage() {
  return (
    <DetailSOP
      breadcrumb={[
        { label: 'Pantau SOP', to: ROUTES.KEPALA_OPD.PANTAU_SOP },
        { label: 'Detail SOP' },
      ]}
      backTo={ROUTES.KEPALA_OPD.PANTAU_SOP}
      showSignButton={true}
    />
  )
}
