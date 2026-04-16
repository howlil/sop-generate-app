import { createFileRoute } from '@tanstack/react-router'
import { GrafikEvaluasiTahunan } from '@/pages/biro-organisasi/grafik-evaluasi'

export const Route = createFileRoute('/biro-organisasi/grafik-evaluasi/')({
  component: GrafikEvaluasiTahunanPage,
})

function GrafikEvaluasiTahunanPage() {
  return <GrafikEvaluasiTahunan />
}
