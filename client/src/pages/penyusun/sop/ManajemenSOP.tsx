import { useState, useMemo } from "react";
import {
  Filter,
  Eye,
  Edit,
  Send,
  Plus,
  FileText,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/data-table";
import { IconActionButton } from "@/components/ui/icon-action-button";
import { Input } from "@/components/ui/input";
import { SearchToolbar } from "@/components/ui/search-toolbar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListPageLayout } from "@/components/layout/ListPageLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { formatDateIdLong } from "@/utils/format-date";
import { ROUTES } from "@/utils/constants";
import type { StatusSOP } from "@/types/dto/sop.dto";
import { SOPStatusFilterSelect } from "@/pages/penyusun/sop/components/SOPStatusFilterSelect";
import { BuatSOPDialog } from "@/pages/penyusun/sop/components/BuatSOPDialog";
import { BukaPengajuanEvaluasiDialog } from "@/pages/penyusun/sop/components/BukaPengajuanEvaluasiDialog";
import {
  canEditSop,
  canPjPenyusunRunCoordinatorActions,
  useDaftarSopData,
  useSopSuspense,
} from "@/api/sop";
import type { SopListQueryParams } from "@/types/dto/sop.dto";
import { useDaftarSopFilters } from "@/hooks/useDaftarSOPFilters";
import { useAppRole } from "@/hooks/useAppRole";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function ManajemenSOP() {
  useDocumentTitle("Manajemen SOP — Penyusun");
  const filterStatusId = "filter-status-sop";
  const filterTanggalDariId = "filter-tanggal-dari-sop";
  const filterTanggalSampaiId = "filter-tanggal-sampai-sop";
  const { role } = useAppRole();
  const filters = useDaftarSopFilters();
  const sopListParams = useMemo((): SopListQueryParams | undefined => {
    const status =
      filters.filterStatus && filters.filterStatus !== "all"
        ? filters.filterStatus
        : undefined;
    const tanggalDari = filters.filterTanggalDari?.trim() || undefined;
    const tanggalSampai = filters.filterTanggalSampai?.trim() || undefined;
    if (!status && !tanggalDari && !tanggalSampai) {
      return undefined;
    }
    return { status, tanggalDari, tanggalSampai };
  }, [filters.filterStatus, filters.filterTanggalDari, filters.filterTanggalSampai]);
  const { list: listFilteredByServer, create } = useSopSuspense(sopListParams);
  const { filteredList } = useDaftarSopData({
    list: listFilteredByServer,
    searchQuery: filters.searchQuery,
  });

  const [isBukaPengajuanEvaluasiDialogOpen, setIsBukaPengajuanEvaluasiDialogOpen] =
    useState(false);
  const [isBuatSOPDialogOpen, setIsBuatSOPDialogOpen] = useState(false);

  return (
    <ListPageLayout
      breadcrumb={[{ label: "Manajemen SOP" }]}
      title="Manajemen SOP"
      description="Daftar SOP yang Anda kelola. Penyusun menyelesaikan penyusunan lewat tombol Selesai di editor (status Siap dievaluasi). PJ Penyusun membuka pengajuan evaluasi ke Biro lewat tombol di halaman ini. Klik baris untuk melihat atau mengedit detail SOP."
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari judul atau nomor SOP..."
          searchValue={filters.searchQuery}
          onSearchChange={(e) => filters.setSearchQuery(e.target.value)}
        >
          <DropdownMenu
            open={filters.isFilterOpen}
            onOpenChange={filters.setIsFilterOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
                {filters.activeFilterCount > 0 && (
                  <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 h-4 min-w-[16px] border-0">
                    {filters.activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-900">
                    Filter SOP
                  </p>
                  {filters.activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-blue-600"
                      onClick={filters.clearFilters}
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <FormField label="Status" htmlFor={filterStatusId}>
                  <SOPStatusFilterSelect
                    id={filterStatusId}
                    value={filters.filterStatus ?? "all"}
                    onValueChange={filters.setStatusFilter}
                  />
                </FormField>
                <FormField label="Terakhir diperbarui">
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      label="Dari"
                      variant="muted"
                      htmlFor={filterTanggalDariId}
                    >
                      <Input
                        id={filterTanggalDariId}
                        type="date"
                        className="h-9 text-xs"
                        value={filters.filterTanggalDari ?? ""}
                        onChange={(e) =>
                          filters.setFilterTanggalDari(e.target.value)
                        }
                      />
                    </FormField>
                    <FormField
                      label="Sampai"
                      variant="muted"
                      htmlFor={filterTanggalSampaiId}
                    >
                      <Input
                        id={filterTanggalSampaiId}
                        type="date"
                        className="h-9 text-xs"
                        value={filters.filterTanggalSampai ?? ""}
                        onChange={(e) =>
                          filters.setFilterTanggalSampai(e.target.value)
                        }
                      />
                    </FormField>
                  </div>
                </FormField>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {canPjPenyusunRunCoordinatorActions(role ?? "") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setIsBukaPengajuanEvaluasiDialogOpen(true)}
            >
              <Send className="w-3.5 h-3.5" />
              Buka pengajuan evaluasi
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => setIsBuatSOPDialogOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Buat SOP Baru
          </Button>
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
                  <Table.Th>Pembuat</Table.Th>
                  <Table.Th>Terakhir diedit</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Aksi</Table.Th>
                </Table.HeadRow>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <EmptyState
                    asTableRow
                    colSpan={7}
                    icon={<FileText />}
                    title="Tidak ada SOP ditemukan"
                    description="Coba ubah filter atau kata kunci pencarian"
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
                        <p className="text-gray-700">{sop.pembuat ?? "—"}</p>
                      </Table.Td>
                      <Table.Td>
                        {sop.terakhirDiedit.nama != null || sop.terakhirDiedit.waktu != null ? (
                          <div>
                            <p className="text-gray-800 text-sm">
                              {sop.terakhirDiedit.nama ?? "—"}
                            </p>
                            {sop.terakhirDiedit.waktu ? (
                              <p className="text-gray-400 text-xs mt-0.5">
                                {formatDateIdLong(sop.terakhirDiedit.waktu)}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-xs">—</p>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <StatusBadge status={sop.status ?? "DRAFT"} />
                      </Table.Td>
                      <Table.Td>
                        <div className="flex items-center justify-center gap-1">
                          {sop.status && canEditSop(sop.status as StatusSOP) ? (
                            <IconActionButton
                              icon={Edit}
                              to={ROUTES.PENYUSUN.DETAIL_SOP}
                              params={{ id: sop.detailSopId ?? sop.id }}
                              state={{
                                sopStatus: sop.status,
                                detailSopId: sop.detailSopId ?? undefined,
                              }}
                              title="Edit"
                            />
                          ) : (
                            <IconActionButton
                              icon={Eye}
                              to={ROUTES.PENYUSUN.DETAIL_SOP}
                              params={{ id: sop.detailSopId ?? sop.id }}
                              state={{
                                sopStatus: sop.status,
                                detailSopId: sop.detailSopId ?? undefined,
                              }}
                              title="Lihat"
                              variant="outline"
                            />
                          )}
                        </div>
                      </Table.Td>
                    </Table.BodyRow>
                  ))
                )}
              </tbody>
            </Table.Table>
          </Table.Root>
        )}
      </Table.Paginated>

      <BukaPengajuanEvaluasiDialog
        open={isBukaPengajuanEvaluasiDialogOpen}
        onOpenChange={setIsBukaPengajuanEvaluasiDialogOpen}
      />

      <BuatSOPDialog
        open={isBuatSOPDialogOpen}
        onOpenChange={setIsBuatSOPDialogOpen}
        onCreate={async (data) => {
          await create({
            judul: data.judul,
            nomorSop: data.nomorSop,
          });
        }}
      />
    </ListPageLayout>
  );
}
