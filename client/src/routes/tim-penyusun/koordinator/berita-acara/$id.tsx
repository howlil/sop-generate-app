import { createFileRoute } from '@tanstack/react-router'
import { DetailBeritaAcaraPage } from '@/pages/tim-penyusun/koordinator/berita-acara/$id'
import { requireRoles } from '@/stores/authStore'

export const Route = createFileRoute('/tim-penyusun/koordinator/berita-acara/$id')({
  beforeLoad: requireRoles(['KOORDINATOR_TIM_PENYUSUN']),
  component: DetailBeritaAcaraPage,
})
