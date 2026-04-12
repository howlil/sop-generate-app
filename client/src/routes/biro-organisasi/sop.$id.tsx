import { createFileRoute } from '@tanstack/react-router'
import { DetailSOP } from '@/pages/kepala-opd/sop-detail'
import { ROUTES } from '@/utils/constants'

export const Route = createFileRoute('/biro-organisasi/sop/$id')({
  component: BiroDetailSOPPage,
})

function BiroDetailSOPPage() {
  return (
    <DetailSOP
      breadcrumb={[
        { label: 'Evaluasi', to: ROUTES.BIRO_ORGANISASI.EVALUASI },
        { label: 'Detail SOP' },
      ]}
      backTo={ROUTES.BIRO_ORGANISASI.EVALUASI}
      showSignButton={false}
    />
  )
}
