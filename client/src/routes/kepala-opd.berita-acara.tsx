import { createFileRoute } from '@tanstack/react-router'
import { BeritaAcaraPage } from '@/pages/kepala-opd/BeritaAcara'

export const Route = createFileRoute('/kepala-opd/berita-acara')({
  validateSearch: (s: Record<string, unknown>): { id?: string } => ({ id: typeof s.id === 'string' ? s.id : undefined }),
  component: BeritaAcaraPage,
})
