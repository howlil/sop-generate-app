import { createFileRoute } from '@tanstack/react-router'
import { DetailSOP } from '@/pages/kepala-opd/DetailSOP'
import { ROUTES } from '@/lib/constants/routes'

export const Route = createFileRoute('/biro-organisasi/detail-sop/$id')({
  component: BiroDetailSOPPage,
})

function BiroDetailSOPPage() {
  return (
    <DetailSOP
      breadcrumb={[
        { label: 'Verifikasi SOP', to: ROUTES.BIRO_ORGANISASI.EVALUASI_SOP },
        { label: 'Detail SOP' },
      ]}
      backTo={ROUTES.BIRO_ORGANISASI.EVALUASI_SOP}
      showSignButton={false}
    />
  )
}
