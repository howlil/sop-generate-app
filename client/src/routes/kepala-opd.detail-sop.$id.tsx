import { createFileRoute } from '@tanstack/react-router'
import { DetailSOP } from '@/pages/kepala-opd/DetailSOP'
import { ROUTES } from '@/utils/constants/ui'

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
