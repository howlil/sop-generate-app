import { createFileRoute } from '@tanstack/react-router'
import { GrafikEvaluasiTahunan } from '@/pages/biro-organisasi/grafik-evaluasi-tahunan'

export const Route = createFileRoute('/biro-organisasi/grafik-evaluasi-tahunan')({
  component: GrafikEvaluasiTahunan,
})
