import { createFileRoute } from '@tanstack/react-router'
import { BeritaAcaraKoordinatorPage } from '@/pages/tim-penyusun/koordinator/berita-acara'
import { requireRoles } from '@/stores/authStore'

export const Route = createFileRoute('/tim-penyusun/koordinator/berita-acara')({
  beforeLoad: requireRoles(['KOORDINATOR_TIM_PENYUSUN']),
  component: BeritaAcaraKoordinatorPage,
})
