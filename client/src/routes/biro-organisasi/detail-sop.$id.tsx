import { createFileRoute } from '@tanstack/react-router'
import { DetailSOP } from '@/pages/kepala-opd/detail-sop'
import { ROUTES } from '@/utils/constants'

export const Route = createFileRoute('/biro-organisasi/detail-sop/$id')({
  component: BiroDetailSOPPage,
})

function BiroDetailSOPPage() {
  return (
    <DetailSOP
      breadcrumb={[
        { label: 'Manajemen Evaluasi SOP', to: ROUTES.BIRO_ORGANISASI.MANAJEMEN_EVALUASI_SOP },
        { label: 'Detail SOP' },
      ]}
      backTo={ROUTES.BIRO_ORGANISASI.MANAJEMEN_EVALUASI_SOP}
      showSignButton={false}
    />
  )
}
