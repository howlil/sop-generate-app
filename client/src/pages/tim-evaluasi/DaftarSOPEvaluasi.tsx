/**
 * Evaluasi SOP: daftar OPD. Satu baris = satu OPD.
 * List SOP per OPD ada di halaman detail OPD (Evaluasi per OPD).
 */
import { Building2, Eye } from 'lucide-react'
import { Table } from '@/components/ui/data-table'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { ROUTES } from '@/lib/constants/routes'
import { SEED_OPD_LIST_EVALUASI, SEED_SOP_BY_OPD } from '@/lib/seed/penugasan-evaluasi-seed'
import { canSelectSOPForEvaluasi } from '@/lib/types/sop'
import { useFilteredList } from '@/hooks/useFilteredList'

export interface OpdEvaluasiItem {
  id: string
  nama: string
  kode: string
  jumlahSop: number
  jumlahLayakEvaluasi: number
}

/** Status "Sedang Disusun" tidak masuk list evaluasi. */
const STATUS_BUKAN_LIST_EVALUASI = 'Sedang Disusun'

function buildOpdList(): OpdEvaluasiItem[] {
  return SEED_OPD_LIST_EVALUASI.map((opd) => {
    const sops = (SEED_SOP_BY_OPD[opd.nama] ?? []).filter((s) => s.status !== STATUS_BUKAN_LIST_EVALUASI)
    const jumlahLayakEvaluasi = sops.filter((s) => canSelectSOPForEvaluasi(s.status)).length
    return {
      id: opd.id,
      nama: opd.nama,
      kode: opd.kode,
      jumlahSop: sops.length,
      jumlahLayakEvaluasi,
    }
  })
}

export function DaftarSOPEvaluasi() {
  const opdList = buildOpdList()
  const {
    filteredList,
    searchQuery,
    setSearchQuery,
  } = useFilteredList(opdList, {
    searchKeys: ['nama', 'kode'],
  })

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Evaluasi SOP' }]}
      title="Evaluasi SOP"
      description="Pilih OPD untuk melihat daftar SOP yang dapat dievaluasi. Evaluasi per OPD, list SOP ada di detail."
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari nama atau kode OPD..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        />
      }
    >
      <Table.Card>
        <Table.Table>
          <thead>
            <Table.HeadRow>
              <Table.Th>Nama OPD</Table.Th>
              <Table.Th align="center">Jumlah SOP</Table.Th>
              <Table.Th align="center">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <EmptyState
                asTableRow
                colSpan={3}
                icon={<Building2 />}
                title="Tidak ada OPD ditemukan"
                description="Coba ubah kata kunci pencarian."
              />
            ) : (
              filteredList.map((opd) => (
                <Table.BodyRow key={opd.id}>
                  <Table.Td className="font-medium text-gray-900">{opd.nama}</Table.Td>
                  <Table.Td className="text-center text-gray-700">{opd.jumlahSop}</Table.Td>
                  <Table.Td className="text-center">
                    <IconActionButton
                      icon={Eye}
                      to={ROUTES.TIM_EVALUASI.EVALUASI_OPD}
                      params={{ opdId: opd.id }}
                      title="Lihat SOP"
                      variant="outline"
                    />
                  </Table.Td>
                </Table.BodyRow>
              ))
            )}
          </tbody>
        </Table.Table>
      </Table.Card>
    </ListPageLayout>
  )
}
