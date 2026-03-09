import { createFileRoute } from '@tanstack/react-router'
import { GrafikEvaluasiTahunan } from '@/pages/kepala-biro-organisasi/GrafikEvaluasiTahunan'

export const Route = createFileRoute('/biro-organisasi/grafik-evaluasi-tahunan')({
  component: GrafikEvaluasiTahunan,
})
