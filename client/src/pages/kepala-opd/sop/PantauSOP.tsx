
import { useMemo, useState } from "react";
import { Eye, FileText } from "lucide-react";
import { Table } from "@/components/ui/data-table";
import { IconActionButton } from "@/components/ui/icon-action-button";
import { SearchToolbar } from "@/components/ui/search-toolbar";
import { SOPStatusFilterSelect } from "@/pages/penyusun/sop/components/SOPStatusFilterSelect";
import { ListPageLayout } from "@/components/layout/ListPageLayout";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateIdLong } from "@/utils/format-date";
import { ROUTES } from "@/utils/constants";
import { useAuthStore } from "@/stores/authStore";
import { useSop } from "@/api/sop";
import type { SopDaftarRow } from "@/types/dto/sop.dto";
import { useOpd } from "@/api/opd";

export function PantauSOP() {
  const opdId = useAuthStore((state) => state.user?.opdId ?? "");
  const { list: allOpds } = useOpd();
  const opd = allOpds.find((o) => o.id === opdId);
  const opdName = opd?.nama ?? "OPD";

  const [filterStatus, setFilterStatus] = useState("all");
  const { list: sopListRaw } = useSop();
  const mergedList = sopListRaw as unknown as SopDaftarRow[];

  const listByStatus = useMemo(
    () =>
      filterStatus === "all"
        ? mergedList
        : mergedList.filter((s) => s.status === filterStatus),
    [mergedList, filterStatus],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return listByStatus;
    return listByStatus.filter((s) =>
      [s.judul, s.nomorSop ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [listByStatus, searchQuery]);

  return (
    <ListPageLayout
      breadcrumb={[{ label: "SOP" }]}
      title="SOP"
      description={`Daftar semua SOP di ${opdName}. Hanya menampilkan SOP yang tercatat untuk OPD Anda.`}
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari judul atau nomor SOP..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        >
          <SOPStatusFilterSelect
            value={filterStatus}
            onValueChange={setFilterStatus}
            className="h-9 w-[200px]"
          />
        </SearchToolbar>
      }
    >
      <Table.Paginated data={filteredList} label="SOP">
        {(pageData) => (
          <Table.Root>
            <Table.Table>
              <thead>
                <Table.HeadRow>
                  <Table.Th>Judul SOP</Table.Th>
                  <Table.Th>Nomor SOP</Table.Th>
                  <Table.Th>Terakhir diperbarui</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Aksi</Table.Th>
                </Table.HeadRow>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <EmptyState
                    asTableRow
                    colSpan={5}
                    icon={<FileText />}
                    title="Tidak ada SOP ditemukan"
                    description="Tidak ada SOP untuk OPD Anda atau tidak cocok dengan pencarian."
                  />
                ) : (
                  pageData.map((sop) => (
                    <Table.BodyRow key={sop.id}>
                      <Table.Td>
                        <p className="font-medium text-gray-900">{sop.judul}</p>
                      </Table.Td>
                      <Table.Td>
                        <p className="font-mono text-gray-700 text-[11px]">
                          {sop.nomorSop ?? "—"}
                        </p>
                      </Table.Td>
                      <Table.Td>
                        <p className="text-gray-700">
                          {sop.terakhirDiperbarui
                            ? formatDateIdLong(sop.terakhirDiperbarui)
                            : "—"}
                        </p>
                      </Table.Td>
                      <Table.Td>
                        <StatusBadge status={sop.status} />
                      </Table.Td>
                      <Table.Td>
                        <IconActionButton
                          icon={Eye}
                          to={ROUTES.KEPALA_OPD.DETAIL_SOP}
                          params={{ id: sop.id }}
                          title="Lihat detail"
                        />
                      </Table.Td>
                    </Table.BodyRow>
                  ))
                )}
              </tbody>
            </Table.Table>
          </Table.Root>
        )}
      </Table.Paginated>
    </ListPageLayout>
  );
}
