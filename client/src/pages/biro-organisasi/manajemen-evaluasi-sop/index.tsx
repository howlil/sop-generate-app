import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import type { PengajuanEvaluasi } from "@/features/evaluasi";
import { useEvaluasi } from "@/features/evaluasi";
import { useOpd } from "@/features/organisasi";
import { Table } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { IconActionButton } from "@/components/ui/icon-action-button";
import { ListPageLayout } from "@/components/layout/ListPageLayout";
import { SearchToolbar } from "@/components/ui/search-toolbar";
import { ROUTES } from "@/utils/constants";
import { IA } from "@/utils/constants";
import { useDocumentTitle } from "@/hooks/use-document-title";

/** Tanggal terakhir untuk urutan (terbaru dulu). */
function getSortDate(p: PengajuanEvaluasi): string {
  return p.createdAt;
}

/** Dianggap "baru" jika tanggal masuk 7 hari terakhir. */
const HARI_BARU = 7;
function isBatchBaru(p: PengajuanEvaluasi): boolean {
  const dateStr = getSortDate(p);
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= HARI_BARU;
}

export interface RowOpdEvaluasi {
  opdId: string;
  opdNama: string;
  batchTerbaru: PengajuanEvaluasi | null;
  jumlahSop: number;
  isBaru: boolean;
}

/** Satu baris per OPD: gabung semua OPD dengan pengajuan evaluasi (jika ada). Match by opdId. */
function buildRowsOpdEvaluasi(
  allOpds: { id: string; nama: string }[],
  pengajuanList: PengajuanEvaluasi[],
): RowOpdEvaluasi[] {
  return allOpds.map((opd) => {
    const pengajuansForOpd = pengajuanList.filter((p) => p.opdId === opd.id);
    const batchTerbaru =
      pengajuansForOpd.length === 0
        ? null
        : pengajuansForOpd.sort((a, b) =>
            getSortDate(b) > getSortDate(a) ? 1 : -1,
          )[0];
    const jumlahSop = batchTerbaru?.sopList?.length ?? 0;
    const isBaru = batchTerbaru != null && isBatchBaru(batchTerbaru);
    return {
      opdId: opd.id,
      opdNama: opd.nama,
      batchTerbaru,
      jumlahSop,
      isBaru,
    };
  });
}

export function ManajemenEvaluasiSop() {
  useDocumentTitle(`${IA.NAV_BIRO_EVALUASI_TERJADWAL} — Biro`);
  const navigate = useNavigate();
  const { list: allOpds } = useOpd();
  const { list: batchList = [] } = useEvaluasi();

  const rowsByOpd = useMemo(
    () => buildRowsOpdEvaluasi(allOpds, batchList),
    [allOpds, batchList],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rowsByOpd;
    return rowsByOpd.filter((row) =>
      row.opdNama.toLowerCase().includes(q),
    );
  }, [rowsByOpd, searchQuery]);

  /** Urutkan: (1) evaluasi baru (7 hari terakhir) paling atas, (2) OPD yang punya evaluasi urut tanggal terbaru dulu, (3) OPD tanpa evaluasi urut nama. */
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      if (a.isBaru && !b.isBaru) return -1;
      if (!a.isBaru && b.isBaru) return 1;
      const hasA = a.batchTerbaru != null;
      const hasB = b.batchTerbaru != null;
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;
      if (hasA && hasB) {
        const da = getSortDate(a.batchTerbaru!);
        const db = getSortDate(b.batchTerbaru!);
        if (db !== da) return db > da ? 1 : -1;
      }
      return a.opdNama.localeCompare(b.opdNama);
    });
  }, [filteredList]);

  const goToDetail = (batch: PengajuanEvaluasi) => {
    navigate({
      to: ROUTES.BIRO_ORGANISASI.DETAIL_EVALUASI,
      params: { id: batch.id },
    });
  };

  return (
    <ListPageLayout
      breadcrumb={[{ label: IA.NAV_BIRO_BATCH_BA }]}
      title={IA.NAV_BIRO_BATCH_BA}
      description={`${IA.BATCH_EVALUASI_OPD} per OPD. Buka detail untuk ${IA.VERIFIKASI_BA_BIRO} pada dokumen ${IA.BERITA_ACARA}.`}
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari OPD atau SOP..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        />
      }
    >
      <Table.Paginated data={sortedList} label="evaluasi">
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
                <tr>
                  <Table.Td
                    colSpan={3}
                    className="p-8 text-center text-gray-500"
                  >
                    Tidak ada OPD.
                  </Table.Td>
                </tr>
              ) : (
                pageData.map((row) => (
                  <Table.BodyRow key={row.opdId}>
                    <Table.Td className="font-medium text-gray-900">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{row.opdNama}</span>
                        {row.isBaru && (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-800 border-0 text-[10px] font-medium shrink-0"
                            title="Terjadwal verifikasi dengan tanggal masuk 7 hari terakhir"
                          >
                            Baru
                          </Badge>
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td className="text-center text-gray-700">
                      {row.jumlahSop}
                    </Table.Td>
                    <Table.Td>
                      <div className="flex items-center justify-center gap-1">
                        {row.batchTerbaru ? (
                          <IconActionButton
                            icon={Eye}
                            title="Detail evaluasi"
                            onClick={() => goToDetail(row.batchTerbaru!)}
                          />
                        ) : (
                          <span className="text-xs text-gray-500">
                            Belum ada evaluasi
                          </span>
                        )}
                      </div>
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
