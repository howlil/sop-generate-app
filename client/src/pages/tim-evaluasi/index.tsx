/**
 * Evaluasi SOP: daftar OPD. Satu baris = satu OPD.
 * List SOP per OPD ada di halaman detail OPD (Evaluasi per OPD).
 */
import { useMemo, useState } from 'react'
import { Building2, Eye } from 'lucide-react'
import { Table } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { ROUTES } from '@/utils/constants'
import { useSop } from '@/features/sop'
import type { SopItem } from '@/types/common'

const EVALUASI_STATUSES = [
  "DIAJUKAN_EVALUASI",
  "SEDANG_DIEVALUASI",
  "REVISI_DARI_TIM_EVALUASI",
  "SIAP_DIVERIFIKASI",
];
const isSopInEvaluasiStatus = (status: string) =>
  EVALUASI_STATUSES.includes(status);
const canSelectSOPForEvaluasiByStatus = (status: string) =>
  status === "DIAJUKAN_EVALUASI";

export interface OpdEvaluasiItem {
  id: string;
  nama: string;
  kode: string;
  jumlahSop: number;
  jumlahLayakEvaluasi: number;
}

function useOpdEvaluasiList(): OpdEvaluasiItem[] {
  const { list: sopListRaw } = useSop();
  const mergedSopList = sopListRaw as unknown as SopItem[];

  return useMemo(() => {
    /** Group SOPs by opdId, collecting unique OPD names from opdId. */
    const opdMap = new Map<string, { sops: typeof mergedSopList }>();
    for (const sop of mergedSopList) {
      const opdId = sop.opdId ?? "unknown";
      if (!opdMap.has(opdId)) opdMap.set(opdId, { sops: [] });
      opdMap.get(opdId)!.sops.push(sop);
    }

    const result: OpdEvaluasiItem[] = [];
    for (const [opdId, { sops }] of opdMap.entries()) {
      const evaluasiSops = sops.filter((s) => isSopInEvaluasiStatus(s.status));
      if (evaluasiSops.length === 0) continue;
      const jumlahLayakEvaluasi = evaluasiSops.filter((s) =>
        canSelectSOPForEvaluasiByStatus(s.status),
      ).length;
      // Use opdId as OPD name (will be replaced with actual name if available from API)
      result.push({
        id: opdId,
        nama: `OPD ${opdId.slice(0, 8)}`,
        kode: opdId,
        jumlahSop: evaluasiSops.length,
        jumlahLayakEvaluasi,
      });
    }
    return result.sort((a, b) => a.nama.localeCompare(b.nama));
  }, [mergedSopList]);
}

export function DaftarSOPEvaluasi() {
  const opdList = useOpdEvaluasiList();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return opdList
    return opdList.filter((item) =>
      [item.nama, item.kode].join(' ').toLowerCase().includes(q)
    )
  }, [opdList, searchQuery])

  return (
    <ListPageLayout
      breadcrumb={[{ label: "Evaluasi SOP" }]}
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
      <Table.Paginated data={filteredList} label="OPD">
        {(pageData) => (
          <Table.Table>
            <thead>
              <Table.HeadRow>
                <Table.Th>Nama OPD</Table.Th>
                <Table.Th align="center">Jumlah SOP</Table.Th>
                <Table.Th align="center">Aksi</Table.Th>
              </Table.HeadRow>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <EmptyState
                  asTableRow
                  colSpan={3}
                  icon={<Building2 />}
                  title="Tidak ada OPD ditemukan"
                  description="Coba ubah kata kunci pencarian."
                />
              ) : (
                pageData.map((opd) => (
                  <Table.BodyRow key={opd.id}>
                    <Table.Td className="font-medium text-gray-900">
                      {opd.nama}
                    </Table.Td>
                    <Table.Td className="text-center">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className="text-gray-700">{opd.jumlahSop}</span>
                        {opd.jumlahLayakEvaluasi > 0 && (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-800 border-0 text-xs font-medium shrink-0"
                            title="SOP baru / perlu evaluasi"
                          >
                            {opd.jumlahLayakEvaluasi} baru
                          </Badge>
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td className="text-center">
                      <IconActionButton
                        icon={Eye}
                        to={ROUTES.TIM_EVALUASI.DETAIL_EVALUASI_OPD}
                        params={{ id: opd.id }}
                        title="Lihat SOP"
                        variant="outline"
                      />
                    </Table.Td>
                  </Table.BodyRow>
                ))
              )}
            </tbody>
          </Table.Table>
        )}
      </Table.Paginated>
    </ListPageLayout>
  );
}
