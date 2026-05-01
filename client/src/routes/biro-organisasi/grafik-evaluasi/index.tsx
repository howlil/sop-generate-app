import { createFileRoute } from '@tanstack/react-router'
import { GrafikEvaluasiTahunan } from '@/pages/biro-organisasi/grafik-evaluasi/GrafikEvaluasiTahunan'
import { RouteErrorPage } from '@/components/ui/route-error'
import { queryClient } from '@/config/query-client'
import { queryKeys } from '@/config/query-keys'
import { evaluasiApi } from "@/api/evaluasi";

export const Route = createFileRoute('/biro-organisasi/grafik-evaluasi/')({
  loader: async () => {
    await queryClient.ensureQueryData({
      queryKey: queryKeys.evaluasiRekap(undefined),
      queryFn: () => evaluasiApi.rekap(undefined),
    })
  },
  component: GrafikEvaluasiTahunan,
  errorComponent: ({ error, reset }) => (
    <RouteErrorPage error={error} reset={reset} />
  ),
})
