import { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ManajemenSOP } from '@/pages/tim-penyusun/sop/ManajemenSOP'
import { RouteErrorPage } from '@/components/ui/route-error'
import { queryClient } from '@/config/query-client'
import { queryKeys } from '@/config/query-keys'
import { sopApi } from '@/api/sop'

export const Route = createFileRoute('/tim-penyusun/sop/')({
  loader: async () => {
    await queryClient.ensureQueryData({
      queryKey: queryKeys.sopList(),
      queryFn: () => sopApi.findAll(),
    })
  },
  component: ManajemenSOPPage,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
})

function ManajemenSOPPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-600">
          Memuat daftar SOP…
        </div>
      }
    >
      <ManajemenSOP />
    </Suspense>
  )
}
