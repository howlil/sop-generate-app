import { createFileRoute } from '@tanstack/react-router'
import { BeritaAcaraPage } from '@/pages/kepala-opd/BeritaAcaraPage'

export const Route = createFileRoute('/kepala-opd/berita-acara')({
  validateSearch: (s: Record<string, unknown>) => ({ id: (s.id as string) ?? undefined }),
  component: BeritaAcaraPage,
})
