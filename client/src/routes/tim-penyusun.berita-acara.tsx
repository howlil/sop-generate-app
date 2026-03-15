import { createFileRoute } from '@tanstack/react-router'
import { BeritaAcaraKoordinatorPage } from '@/pages/tim-penyusun/BeritaAcaraPage'

export const Route = createFileRoute('/tim-penyusun/berita-acara')({
  validateSearch: (s: Record<string, unknown>) => ({ id: (s.id as string) ?? undefined }),
  component: BeritaAcaraKoordinatorPage,
})
