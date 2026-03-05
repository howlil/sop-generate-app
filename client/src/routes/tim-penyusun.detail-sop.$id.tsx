import { createFileRoute, useSearch } from '@tanstack/react-router'
import { DetailSOP } from '@/pages/kepala-opd/DetailSOP'
import { DetailSOPPenyusun } from '@/pages/tim-penyusun/DetailSOPPenyusun'

export const Route = createFileRoute('/tim-penyusun/detail-sop/$id')({
  validateSearch: (s): { from?: 'daftar' } => ({ from: s?.from === 'daftar' ? 'daftar' : undefined }),
  component: TimPenyusunDetailSOP,
})

function TimPenyusunDetailSOP() {
  const search = useSearch({ from: '/tim-penyusun/detail-sop/$id' })
  return search.from === 'daftar' ? <DetailSOP /> : <DetailSOPPenyusun />
}
